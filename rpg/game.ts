import { randElm } from '@/utils/jsutils';
import Cache from 'archcache';
import { EventEmitter } from 'eventemitter3';
import { ActParams, Blockers, TGameAction } from 'rpg/actions';
import * as itemgen from 'rpg/builders/itemgen';
import { Craft } from 'rpg/builders/itemgen';
import { CookItem, TryEat } from 'rpg/char/cooking';
import { Combat } from 'rpg/combat/combat';
import { Loot } from 'rpg/combat/loot';
import { TargetFlags } from 'rpg/combat/targets';
import { TCombatAction } from 'rpg/combat/types';
import { AttackInfo, TGameEvents } from 'rpg/events';
import type { ItemIndex } from 'rpg/items/container';
import { GoldDrop } from 'rpg/items/gold';
import { Grave } from 'rpg/items/grave';
import { ItemType } from 'rpg/items/types';
import { Spell } from 'rpg/magic/spell';
import { GenPotion } from 'rpg/parsers/potions';
import { quickSplice } from 'rpg/util/array';
import { AddValues, MissingProp } from 'rpg/values/apply';
import type Block from 'rpg/world/block';
import { Char } from './char/char';
import { ItemPicker } from './inventory';
import { Item } from './items/item';
import { Potion } from './items/potion';
import { Wearable } from './items/wearable';
import { Mob, TActor } from './monster/monster';
import { GuildManager } from './social/guild';
import { Party } from './social/party';
import * as Trade from './trade';
import { DirVal, Loc, toDirection } from './world/loc';
import { World } from "./world/world";

const LOC_UPDATE_MS = 3000;

export class Game<A extends Record<string, TGameAction> = Record<string, TGameAction>,
	K extends string & keyof A = string & keyof A> {

	private readonly charCache: Cache<Char>;
	readonly world: World

	// map every character in a party to Party instance.
	private readonly _charParties: { [char: string]: Party } = {};

	private readonly guilds: GuildManager;

	readonly events = new EventEmitter<TGameEvents>();

	readonly actions: A;

	/**
	 * locations with active npcs.
	 */
	readonly liveLocs: Record<string, Loc> = {}

	private updateTimer: NodeJS.Timeout | null = null;

	/**
	 * Combat control for game.
	 */
	readonly combat = new Combat(this);

	/**
	 *
	 * @param rpg
	 */
	constructor(cache: Cache<any>, charCache: Cache<Char>, actions: A) {

		this.actions = actions;

		this.world = new World(cache.subcache<Block>('world'));

		this.charCache = charCache;

		this.guilds = new GuildManager(cache.subcache('guilds'));

		this.updateTimer = setInterval(() => this.updateLocs(), LOC_UPDATE_MS);

		this.events.on('actorDie', this.onCharDie, this);
	}

	/**
	 * Add npc to list of live-updating npcs.
	 * @param npc 
	 */
	setLiveLoc(loc: Loc) {
		this.liveLocs[loc.key] = loc;
	}

	private async updateLocs() {

		let liveNpcs: number;

		for (const k in this.liveLocs) {

			liveNpcs = 0;

			const loc = this.liveLocs[k];
			const chars = loc.chars;

			for (let i = loc.npcs.length - 1; i >= 0; i--) {

				const npc = loc.npcs[i];
				// died between frames.
				if (!npc.isAlive()) continue;

				this.tickDots(npc);
				if (!npc.isAlive()) continue;

				if (npc.dots.length > 0) {
					liveNpcs++;
				}

				if (!chars.length || !npc.attacks.length) continue;

				const targ = await this.getChar(randElm(chars));
				const atk = randElm(npc.attacks);

				if (targ && atk) {
					await this.combat.tryAttack(npc, atk, targ);
				}

				liveNpcs++;

			}
			if (liveNpcs === 0) {
				// no npcs active here.
				delete this.liveLocs[k];
			}

		}

	}

	private tickDots(char: TActor) {

		const efx = char.dots;
		if (!efx) return;

		for (let i = efx.length - 1; i >= 0; i--) {

			const e = efx[i];
			if (e.tick(char, this)) {

				// efx end.
				quickSplice(efx, i);
				e.end(char);

			}

		}

	}

	/**
	 * Test if character can perform an action
	 * in their current state.
	 * @param char
	 * @param act - action to attempt to perform.
	 */
	canAct(char: Char, act: K) {
		if (Blockers[char.state]?.[act]) {
			char.log(`Cannot ${act} while ${char.state}.`);
			return false;
		}
		return true;
	}

	async action<T extends K>(
		act: T, char: Char,
		...params: ActParams<A[T]>) {

		char.clearLog();

		if (!this.canAct(char, act)) return char.output();

		if (char.isAlive()) {
			if (this.actions[act].tick) {
				this.tickDots(char);
			}
			if (this.actions[act].rest) {
				char.recover(this.actions[act].rest);
			}
		}

		return await (this.actions[act].exec as Function).apply(
			this, [char, ...params]
		);

	}

	async attack(this: Game<A, K>, src: Char, targ: TActor, atk?: TCombatAction) {

		let p2: TActor | Party | undefined = targ instanceof Char ? this.getParty(targ) : undefined;
		if (!p2 || !p2.at.equals(targ.at)) {
			p2 = targ;
		}

		atk ??= randElm(src.attacks);
		if (atk) {
			await this.combat.tryAttack(src, atk, p2);

			// reprisal.
		}

		return src.flushLog();

	}

	async cast(this: Game<A, K>, char: Char, spell: Spell, targ?: Char | Mob) {

		// pay cast.
		if (spell.cost) {

			const missing = MissingProp(char, spell.cost);
			if (missing) {
				char.output(`Not enough ${missing} to cast ${spell.name}`);
				return;
			} else {
				AddValues(char, spell.cost);
			}

		}

		const loc = await this.world.getOrGen(char.at);

		char.log(`${char.name} casts ${spell.name}`);

		// single target.
		if (targ) {

			this.combat.doAttack(char, spell, targ);

		} else if (spell.target & TargetFlags.mult) {

			const loc = await this.world.getOrGen(char.at);
			const targs = await this.getTargets(char, spell.target, loc);

			let k: keyof typeof targs;
			for (k in targs) {

				if (targs[k]) {
					this.combat.doAttack(char, spell, targs[k]!);
				}

			}

		} else if (spell.target === TargetFlags.none) {
			// generalized spell.
			console.log(`no spell targ.`);
		}

	}

	brew(this: Game<A, K>, char: Char, itemName: string, imgURL?: string) {

		if (!char.hasTalent('brew')) return `${char.name} does not know how to brew potions.`;

		const pot = GenPotion(itemName);
		if (!pot) return `${char.name} does not know how to brew ${itemName}.`;

		const s = char.statRoll('wis');
		if (s < 10 * pot.level) {
			return char.output(`${char.name} failed to brew ${itemName}.`);
		}

		if (pot.level) char.addExp(2 * pot.level);
		char.addHistory('brew');
		const ind = char.addItem(pot);

		return char.output(`${char.name} brewed ${itemName}. (${ind})`);

	}

	async onCharHit(char: TActor, attacker: TActor | string, info: AttackInfo) {

		const logger = (attacker instanceof Char ? attacker : char);

		// log hit with first 'human' user.
		logger.send(
			`${attacker.toString()} hits ${char.name} with ${info.name} for ${info.dmg} damage.`
		);
		char.log(`hp: ${char.hp.valueOf()}/${char.hp.max.valueOf()}`);

	}

	/**
	 * @param char 
	 * @param slayer - string if no other information on attacker is known.
	 * for example, killed by a potion, which no longer exists. 
	 */
	async onCharDie(char: TActor, slayer: TActor | string) {

		if (slayer instanceof Char) {
			this.onSlay(slayer, char);
		}

		if (char instanceof Char) {

			/// should be world log.
			char.log(
				await this.world.put(char, Grave.MakeGrave(char,
					slayer
				))
			);

		} else if (char instanceof Mob) {
			const loc = await this.world.getLoc(char.at);
			if (loc) {
				loc.removeNpc(char);
				await this.getLoot(itemgen.GenLoot(char), loc,
					typeof slayer === 'object' ? slayer : loc
				);
			}
		}



	}

	/**
	 * Called when player character makes a kill.
	 * @param slayer 
	 * @param targ 
	 * @param party 
	 */
	async onSlay(slayer: Char, targ: TActor, party?: Party) {


		if (targ instanceof Char) {

			const exp = this.combat.pvpExp(targ.level.valueOf());
			party ? await party.addExp(exp) : slayer.addExp(exp);

			slayer.evil = +slayer.evil + (-targ.evil) / 2 + 1 + targ.getModifier('cha');
			slayer.addHistory('pk');

		} else {

			const exp = this.combat.npcExp(targ.level.valueOf());
			party ? await party.addExp(exp) : slayer.addExp(exp);

			if (targ.evil) slayer.evil += (-targ.evil / 4);
			slayer.addHistory('slay');

		}

	}

	async getLoot(loot: Loot, loc: Loc, dest?: TActor | Loc) {

		if (!loot.gold && (loot.items.length === 0)) return;
		if (!dest || dest instanceof Mob) dest = loc;

		if (dest == null) return;

		let resp = dest.name + ' loots';

		if (loot.gold) {

			if ('gold' in dest) {
				dest.gold += loot.gold;
			} else {
				loot.items.push(new GoldDrop(loot.gold));
			}
			resp += ` ${loot.gold} gold`;

		}

		const items = loot.items;
		if (items && items.length > 0) {

			const ind = dest.addItem(items);

			if (loot.gold) resp += ',';
			for (let i = items.length - 1; i >= 1; i--) {

				resp += ` ${items[i].name} (${ind + i}),`;

			}
			resp += ` ${items[0].name} (${ind})`;

		}

		return resp;

	}

	/**
	 * Get all targets at location that are affected by target flags.
	 * @param char 
	 * @param flags 
	 * @param loc 
	 */
	async getTargets(char: TActor, flags: TargetFlags, loc: Loc) {

		const res: Record<string, TActor | undefined> = {};

		const party = char instanceof Char ? this.getParty(char) : undefined;

		if (flags & TargetFlags.enemies) {
			for (const m of loc.npcs) {

				if (!(char.team & m.team)) {
					res[m.id] = m;;
				}

			}
			for (const id of loc.chars) {

				if (party?.includes(id)) continue;
				const p = await this.charCache.fetch(id);
				if (p) res[p.id] = p;
			}
		}

		if (flags & TargetFlags.allies) {
			for (const m of loc.npcs) {

				if ((char.team & m.team)) {
					res[m.id] = m;
				}

			}
			if (party) {
				for (const id of loc.chars) {

					if (!party.includes(id)) continue;
					const p = await this.charCache.fetch(id);
					if (p) res[p.id] = p;
				}
			}
		}

		if (flags & TargetFlags.self) res[char.id] = char;
		else res[char.id] = undefined;

		return res;

	}

	cook(this: Game<A, K>, char: Char, what: string | number | Item) {

		let item = what instanceof Item ? what : char.inv.get(what);
		if (!item) return 'Item not found.';

		if (item.type === ItemType.Food) return item.name + ' is already food.';

		char.addHistory('cook');
		CookItem(item);
		return `${char.name} cooks '${item.name}'`;

	}

	craft(this: Game<A, K>, char: Char, itemName: string, desc?: string, imgURL?: string) {

		const ind = Craft(char, itemName, desc, imgURL);
		return char.output(`${char.name} crafted ${itemName}. (${ind})`);

	}

	destroy(this: Game<A, K>, char: Char, first: string | number, end?: string | number | null) {

		if (end) {

			const items = char.takeRange(first, end);
			if (!items) return char.output('Invalid item range.');
			return char.output(items.length + ' items were destroyed.');

		} else {

			const item = char.takeItem(first);
			if (!item) return char.output(`'${first}' not in inventory.`);
			return char.output(item.name + ' is gone forever.');

		} //

	}

	async move(this: Game<A, K>, char: Char, dir: string) {

		const loc = await this.world.tryMove(char, toDirection(dir));
		if (!loc) return;

		char.log(char.name + ' is' + loc.look(char));

		const p = this.getParty(char);
		if (p && p.leader === char.id) {
			await p.move(this.world, loc);
		}

		return loc;

	}

	async hike(this: Game<A, K>, char: Char, dir: DirVal) {

		const d = char.at.abs();

		let r = char.statRoll() + char.getModifier('dex') + char.getModifier('wis');
		const p = this.getParty(char);

		r -= d / 10;
		if (p && p.isLeader(char)) r -= 5;
		if (!char.hasTalent('hike')) r -= 20;

		if (r < 0) {
			char.hp.add(-Math.floor(Math.random() * d));
			return char.output(`${char.name} was hurt trying to hike. hp: (${char.hp}/${char.hp.max})`);
		}
		else if (r < 10) return char.output('You failed to find your way.');

		const loc = await this.world.hike(char, toDirection(dir));
		if (!loc) return char.output('You failed to find your way.');

		if (p && p.leader === char.name) {

			//console.log('Moving party to: ' + char.loc.toString() );
			await p.move(this.world, loc);

		}

		return char.output(`${char.name}: ${loc.look(char)}`);

	}

	getParty(char: Char) { return this._charParties[char.id]; }

	getChar(charId: string) {
		return this.charCache.fetch(charId);
	}

	makeParty(char: Char, ...invites: string[]) {

		const p = new Party(char, this.charCache);
		this._charParties[char.name] = p;

		for (let i = invites.length - 1; i >= 0; i--) p.invite(invites[i]);

	}

	setLeader(char: Char, tar?: Char) {

		const party = this.getParty(char);
		if (!party) return 'You are not in a party.';

		if (!tar) { return `Party leader: ${party.leader}.` }

		if (!party.isLeader(char)) return 'You are not the party leader.';

		if (party.setLeader(tar)) return `${tar.name} is now the party leader.`;
		return `Could not set ${tar.name} to party leader.`;
	}

	async party(char: Char, who?: Char) {

		const party = this.getParty(char);
		if (!who) return await party?.getStatus() ?? "You are not in a party.";

		const other = this.getParty(who);

		if (party) {

			if (other === party) return `${who.name} is already in your party.`;
			if (other) return `${who.name} is already in a party:\n${party.getList()}`;
			if (!party.isLeader(char)) return 'You are not the party leader.';

			party.invite(who);
			return `${char.name} has invited ${who.name} to join their party.`;

		} else if (other) {

			// attempt to accept.
			if (!other.acceptInvite(char)) return `${other.getList()}\\nnYou have not been invited to ${other.leader}'s awesome party.`;

			this._charParties[char.name] = other;
			return `${char.name} Joined ${other.leader}'s party.`;

		} else {

			// neither has party. new party with invite.
			this.makeParty(char, who.name);
			return `${char.name} has invited ${who.name} to join their party.`;

		} //

	}

	leaveParty(char: Char) {

		const name = char.name;

		const p = this.getParty(char);
		if (!p) return `${name} is not in a party.`;
		delete this._charParties[name];

		if (p.leave(char)) {
			// party contains <=1 person, and no invites.
			p.roster.forEach(n => delete this._charParties[n]);
			return `${name}'s party has been disbanded.`;
		}

		return `${name} has left the party.`;

	}

	async mkGuild(char: Char, gname: string) {

		if (char.guild) return `${char.name} is already in a guild.`;

		if (await this.guilds.GetGuild(gname)) {
			return `${gname} already exists.`;
		}

		await this.guilds.MakeGuild(gname, char);
		char.guild = gname;

		return `${char.name} created guild '${gname}'.`;

	}

	async joinGuild(char: Char, gname: string) {

		if (char.guild) return `${char.name} is already in a guild.`;

		const g = await this.guilds.GetGuild(gname);
		if (!g) return `${gname} does not exist.`;

		if (g.acceptInvite(char)) {
			char.guild = gname;
			return `${char.name} has joined ${gname}.`;
		}
		return `${char.name} has not been invited to ${gname}.`;

	}

	async leaveGuild(char: Char) {

		const g = char.guild ? await this.guilds.GetGuild(char.guild) : null;
		if (!g) {
			return `${char.name} is not in a guild.`;
		}

		g.leave(char);
		char.guild = undefined;

		return `${char.name} has left ${g.name}.`;

	}

	async guildInv(char: Char, who: Char) {

		const g = char.guild ? await this.guilds.GetGuild(char.guild) : null;
		if (!g) {
			return `${char.name} is not in a guild.`;
		}

		if (!g.isLeader(char)) {
			return `You do not have permission to invite members to ${g.name}.`;
		}
		g.invite(who);

		return `${who.name} invited to guild '${g.name}'.`;

	}

	async goHome(this: Game<A, K>, char: Char) {
		return char.output(await this.world.goHome(char));
	}

	compare(char: Char, wot: ItemIndex): string {

		const it = char.getItem(wot) as Item | undefined;
		if (!it) return 'Item not found.';

		let res = 'In Pack: ' + it.getDetails() + '\n';
		if (it instanceof Wearable) {
			const eq = char.getEquip(it.slot);

			if (!eq) res += 'Equip: nothing';
			else if (Array.isArray(eq)) res += 'Equip: ' + Item.DetailsList(eq);
			else res += 'Equip: ' + eq.getDetails();
		} else {
			res += `${it.name} cannot be equipped.\n`;
		}
		return res;

	}

	equip(this: Game<A, K>, char: Char, wot: ItemIndex) {

		let res = char.equip(wot);
		if (res === true) res = `${char.name} equips ${wot}`;	// TODO,echo slot used.
		else if (typeof res === 'string') {
			return res;
		} else res = `${char.name} does not have ${wot}`;

		return char.output(res);

	}

	inscribe(this: Game<A, K>, char: Char, wot: ItemIndex, inscrip: string) {

		const item = char.getItem(wot) as Item | undefined;
		if (!item) return char.output('Item not found.');

		item.inscrip = inscrip;
		char.addHistory('inscribe');

		return char.output(`${item.name} inscribed.`);

	}


	sell(this: Game<A, K>, char: Char, first: string | number, end?: string | number | null) {

		return char.output(Trade.sell(char, first, end));

	}

	give(this: Game<A, K>, char: Char, dest: Char, what: string) {

		return char.output(Trade.transfer(char, dest, what));

	}

	useLoc(char: Char, wot: ItemIndex) {
		return this.world.useLoc(char, wot);
	}


	unequip(this: Game<A, K>, char: Char, slot?: string) {

		if (!slot) {
			return char.output('Specify an equip slot to remove.');
		}

		if (char.unequip(slot)) return char.output('Removed.');
		return char.output('Cannot unequip from ' + slot);

	}

	async drop(this: Game<A, K>, char: Char, what: ItemPicker, end?: ItemIndex | null) {

		return char.output(await this.world.drop(char, what, end));

	}

	async take(this: Game<A, K>, char: Char, first: ItemIndex, end?: ItemIndex | null) {
		return char.output(await this.world.take(char, first, end));
	}

	revive(this: Game<A, K>, char: Char, targ: Char) {

		if (targ.state !== 'dead') return `${targ.name} is not dead.`;
		const p = this.getParty(char);
		if (!p || !p.includes(targ)) return `${targ.name} is not in your party.`;

		let roll = char.statRoll('wis') + (2 * targ.hp.value) - 5 * +targ.level;
		if (!char.hasTalent('revive')) roll -= 20;
		if (roll < 10) return char.output(`You failed to revive ${targ.name}.`);

		char.addHistory('revived');

		targ.revive();
		return char.output(`You have revived ${targ.name}.`);

	}

	async rest(this: Game<A, K>, char: Char) {

		const p = this.getParty(char);
		if (p && p.isLeader(char)) {

			const pct = Math.round(100 * await p.rest());
			if (pct === 100) return char.output(`${p.name} fully rested.`);
			else return char.output(`${p.name} ${pct}% rested.`);

		} else char.rest();

		return char.output(`${char.name} rested. hp: ${char.hp}/${char.hp.max}`);

	}

	scout(this: Game<A, K>, char: Char) {

		const r = char.statRoll('int');

		if (r < 5) return char.output('You are lost.');

		const err = Math.floor(400 / r);
		const x = Math.round(char.at.x + err * (Math.random() - 0.5));
		const y = Math.round(char.at.y + err * (Math.random() - 0.5));

		return char.output(`You believe you are near (${x},${y}).`);

	}

	track(this: Game<A, K>, char: Char, targ: Char) {

		let r = (char.statRoll('int')); // - (targ.statRoll('wis')
		if (char.hasTalent('track')) r *= 2;
		else r -= 10;

		const src = char.at;
		const dest = targ.at;
		const d = src.dist(dest);

		if (d === 0) return char.output(`${targ.name} is here.`);
		else if (d <= 2) return char.output(`You believe ${targ.name} is nearby.`);
		else if (d > r) return char.output(`You find no sign of ${targ.name}`);

		const a = Math.atan2(dest.y - src.y, dest.x - src.x) * 180 / Math.PI;
		const abs = Math.abs(a);

		let dir;
		if (abs < (90 - 45 / 2)) dir = 'east';
		else if (abs > (180 - (45 / 2))) dir = 'west';

		if (a > 0 && Math.abs(90 - a) < (3 * 45) / 2) dir = dir ? 'north ' + dir : 'north';
		else if (a < 0 && Math.abs(-90 - a) < (3 * 45) / 2) dir = dir ? 'south ' + dir : 'south';

		let dist;
		if (d < 20) dist = '';
		else if (d < 50) dist = 'somewhere';
		else if (d < 125) dist = 'far';
		else if (d < 225) dist = 'incredibly far';
		else if (d < 300) dist = 'unbelievably far';
		else dist = 'imponderably far';

		return char.output(`You believe ${targ.name} is ${dist ? dist + ' ' : ''}to the ${dir}.`);

	}

	async steal(this: Game<A, K>, src: Char, dest: Char, wot?: ItemPicker | null) {

		await this.combat.trySteal(src, dest, wot);
		return src.output();

	}

	quaff(this: Game<A, K>, char: Char, wot: ItemIndex) {

		const p = char.getItem(wot) as Item | undefined;
		if (!p) return char.output('Item not found.');
		if (p.type !== 'potion') return char.output(`${p.name} cannot be quaffed.`);

		// remove the potion.
		char.takeItem(p);
		if (p instanceof Potion) {
			char.addHistory('quaff');
			p.quaff(char);

			return char.output(`${char.name} quaffs ${p.name}.`);
		} else {
			return char.output(`${p} cannot be quaffed.`);
		}

	}

	eat(this: Game<A, K>, char: Char, what: ItemIndex) {

		const item = char.inv.get(what);
		if (!item) {
			char.log('Item not found.');
		} else if (!TryEat(char, item)) {
			// return to inventory.
			char.inv.take(item);
		}

		return char.output();

	}

} //Game