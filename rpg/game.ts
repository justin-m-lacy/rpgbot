import Cache from 'archcache';
import { SendableChannels } from 'discord.js';
import { EventEmitter } from 'eventemitter3';
import { ActParams, Blockers, TGameAction } from 'rpg/actions';
import * as itemgen from 'rpg/builders/itemgen';
import { Craft } from 'rpg/builders/itemgen';
import { ChannelStore } from 'rpg/channel-store';
import { Actor } from 'rpg/char/actor';
import { Combat } from 'rpg/combat/combat';
import { useLikeStore } from 'rpg/combat/like-store';
import { Loot } from 'rpg/combat/loot';
import { TargetFlags } from 'rpg/combat/targets';
import { TNpcAction } from 'rpg/combat/types';
import { AttackInfo, TGameEvents } from 'rpg/events';
import type { ItemIndex } from 'rpg/items/container';
import { GoldDrop } from 'rpg/items/gold';
import { Grave } from 'rpg/items/grave';
import { HumanSlot, toSlot } from 'rpg/items/wearable';
import { Spell } from 'rpg/magic/spell';
import { TryEat } from 'rpg/talents/cook';
import { quickSplice } from 'rpg/util/array';
import { smallNum } from 'rpg/util/format';
import { AddValues, MissingProp } from 'rpg/values/apply';
import { Block } from 'rpg/world/block';
import { TCoord } from 'rpg/world/coord';
import { Shop } from 'rpg/world/shop';
import { Char } from './char/char';
import { Mob, TActor } from './char/mobs';
import { ItemPicker } from './inventory';
import { Item } from './items/item';
import { Potion } from './items/potion';
import { GuildManager } from './social/guild';
import { Party } from './social/party';
import * as Trade from './trade';
import { DirVal, Loc, ToDirStr } from './world/loc';
import { World } from "./world/world";

const LOC_UPDATE_MS = 1000 * 20;

export class Game<A extends Record<string, TGameAction> = Record<string, TGameAction>,
	K extends (string & keyof A) = string & keyof A> {

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

	readonly likeStore = useLikeStore(this);

	/**
	 * Combat control for game.
	 */
	readonly combat = new Combat(this);

	constructor(cache: Cache<any>, charCache: Cache<Char>, actions: A) {

		this.actions = actions;

		this.world = new World(
			charCache, cache.subcache<Block>('world', (data) => new Block(data)));

		this.charCache = charCache;

		this.guilds = new GuildManager(cache.subcache('guilds'));

		this.updateTimer = setInterval(() => this.updateLocs(), LOC_UPDATE_MS).unref();

		this.events.on('charDie', this.onCharDie, this);
		this.events.on('charHit', this.onCharHit, this);
	}

	stop() {
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
		}
	}

	/**
	 * Add npc to list of live-updating npcs.
	 * @param npc 
	 */
	setLiveLoc(loc: Loc | TCoord) {
		if ('id' in loc) {
			this.liveLocs[loc.id] = loc;
		} else {
			const v = this.world.getLoc(loc);
			if (v) this.liveLocs[v.id] = v;
		}
	}

	/**
	 * Send message to all chars at location.
	 * @param loc 
	 * @param msg 
	 */
	async sendLoc(loc: Loc, msg: string) {

		const arr: SendableChannels[] = [];

		for (let i = loc.chars.length - 1; i >= 0; i--) {
			const chan = ChannelStore.get(this.getChar(loc.chars[i]));
			if (chan && !arr.some(v => v.id === chan.id)) {
				arr.push(chan);
			}
		}
		return Promise.allSettled(arr.map(v => v.send(msg)));

	}

	async send(char: TActor, msg: string) {
		const chan = ChannelStore.get(char);
		if (chan) {
			return chan.send(msg);
		} else {
			const loc = this.world.getLoc(char.at);
			if (loc) return this.sendLoc(loc, msg)
		}

	}

	private async updateLocs() {

		let hasChars = false;

		for (let k in this.liveLocs) {

			hasChars = false;

			const loc = this.liveLocs[k];

			const npcs: TActor[] = (loc.npcs as TActor[]).slice(0);

			const targs: TActor[] = [];
			for (let i = loc.chars.length - 1; i >= 0; i--) {
				const c = this.getChar(loc.chars[i]);
				if (!c) continue;
				hasChars = true;
				for (let m of c.minions) {
					if (m.isAlive()) npcs.push(m);
				}
				if (c.isAlive()) targs.push(c)

			}

			for (let i = npcs.length - 1; i >= 0; i--) {

				const npc = npcs[i];
				// died between frames.
				if (!npc.isAlive()) {
					quickSplice(npcs, i);
				}
				this.tickDots(npc);
				if (!npc.isAlive()) {
					quickSplice(npcs, i)
				}
				targs.push(npc);

			}

			if (hasChars && npcs.length) {
				await this.combat.doNpcActions(loc, npcs, targs);
			} else {
				delete this.liveLocs[k];
			}

		}

	}

	/**
	 * move mob to new location.
	 * @param mob 
	 * @param from 
	 * @param to 
	 */
	private moveMob(mob: Mob, from: Loc, to: Loc) {

		from.removeNpc(mob);
		to.addNpc(mob);
		this.setLiveLoc(to);

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

	/**
	 * Execute char command.
	 * @param act 
	 * @param char 
	 * @param args 
	 * @returns 
	 */
	async exec<S extends K>(
		act: S, char: Char,
		...args: ActParams<A[S]>): Promise<string> {

		char.clearLog();

		if (!this.canAct(char, act)) return char.flushLog();

		if (char.isAlive()) {
			if (this.actions[act].tick) {
				this.tickDots(char);
			}
			///todo: party recover instead.
			if (this.actions[act].rest) {
				char.rest(this.actions[act].rest);
			}
		}
		if ('exec' in this.actions[act]) {
			await this.actions[act].exec.apply(
				this, [char, ...args]
			);

		} else {

			const talent = this.actions[act].talent;
			if (talent.trained && !char.hasTalent(talent.id)) {
				char.log(`${char.name} does not know how to ${talent.name}`);
			} else {

				if (await talent.exec(this, char, ...args)) {
					char.addHistory(talent.id);
				}

			}

		}
		return char.flushLog();

	}

	async attack(this: Game<A, K>, src: TActor, targ: TActor, atk?: TNpcAction) {

		let p2: TActor | Party | undefined = targ instanceof Char ? this.getParty(targ) : undefined;
		if (!p2 || !p2.at.equals(targ.at)) {
			p2 = targ;
		}

		console.log(`attack cmd.: ${src}`);
		await this.combat.tryAttack(src, atk ?? src.getAttack(), p2);

		// reprisal.
		if (targ.isAlive()) {
			if (targ.attacks) {
				await this.combat.tryAttack(targ, targ.getAttack(), src);
			}
			if (targ instanceof Mob) {
				this.setLiveLoc(targ.at);
			}
		}

	}

	/**
	 * 
	 * @param this 
	 * @param char 
	 * @param spell 
	 * @param targ 
	 * @param free - cast spell for free. (cast from item.)
	 * @returns 
	 */
	async cast(this: Game<A, K>, char: TActor, spell: Spell, targ?: TActor, free: boolean = false) {

		// pay cast.
		if (spell.cost && !free) {

			const missing = MissingProp(char, spell.cost);
			if (missing) {
				char.log(`Not enough ${missing} to cast ${spell.name}`);
				return;
			} else {
				AddValues(char, spell.cost);
			}

		}

		char.log(`${char.name} casts ${spell.name}`);

		// single target.
		if (targ?.isAlive()) {

			this.combat.doAttack(char, spell, targ);
			if (targ instanceof Mob) {
				this.setLiveLoc(char.at);
			}


		} else if (spell.target & TargetFlags.mult) {

			const loc = await this.world.getOrGen(char.at);
			const targs = await this.getTargets(char, spell.target, loc);

			let k: keyof typeof targs;
			for (k in targs) {

				if (targs[k]) {
					this.combat.doAttack(char, spell, targs[k]!);
				}

			}
			this.setLiveLoc(loc);

		} else if (spell.target === TargetFlags.none) {
			// generalized spell.
			console.log(`no spell targ.`);

		}

	}



	async onCharHit(char: TActor, attacker: TActor | string, info: AttackInfo) {

		// log hit with first 'human' user.
		return this.send(char,
			`${typeof attacker === 'string' ? attacker : attacker.name} hits ${char.name} with ${info.name} for ${info.dmg.toFixed(1)} damage.  (${smallNum(char.hp)}/${smallNum(char.hp.max)})`
		);
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

		this.send(char, `${char.name} slain by ${typeof slayer === 'string' ? slayer : slayer.name}.`);

		if (char instanceof Char) {

			/// should be world log.
			this.send(char,
				await this.world.put(char, Grave.MakeGrave(char,
					slayer
				))
			);

		} else if (char instanceof Mob) {
			const loc = await this.world.fetchLoc(char.at);
			if (loc) {
				loc.removeNpc(char);
				await this.getLoot(itemgen.GenLoot(char), loc,
					typeof slayer === 'object' ? slayer : loc
				);
			} else {
				console.log(`npc no loc: ${char.at}`);
			}
		} else {
			console.log(`dead char is not npc or mob or anything`);
		}



	}

	/**
	 * Called when player character makes a kill.
	 * @param slayer 
	 * @param targ 
	 * @param party 
	 */
	async onSlay(slayer: Char, targ: TActor, party?: Party) {

		if (targ instanceof Actor) {

			const exp = this.combat.pvpExp(targ.level.valueOf());
			party ? await party.addExp(exp) : slayer.addExp(exp);

			slayer.teams.addRanks(targ.teams.ranks, -Math.max(targ.level.valueOf() + targ.getModifier('cha'), 1) / 8);

			slayer.addHistory('pk');

		} else {

			const exp = this.combat.npcExp(targ.level.valueOf());
			party ? await party.addExp(exp) : slayer.addExp(exp);

			slayer.teams.addRank(targ.team, -Math.max(targ.level.valueOf() + 1 + targ.getModifier('cha'), 1) / 8);

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
	 * Get dead Chars at a location.
	 * @param at 
	 * @param skipId - optional char id to skip. (usually self)
	 */
	async getDeadChars(at: TCoord, skipId?: string) {

		const loc = await this.world.fetchLoc(at);
		if (!loc?.chars.length) return undefined;

		const res: Char[] = [];
		const chars = loc.chars;
		for (let i = 0; i < chars.length; i++) {

			if (chars[i] == skipId) continue;

			const char = await this.loadChar(chars[i]);
			if (char && !char.isAlive()) {
				res.push(char);
			}

		}

		return res;

	}

	/**
	 * Get dead Chars at a location.
	 * @param at 
	 * @param skipId - optional char id to skip. (usually self)
	 */
	async getAliveChars(at: TCoord, skipId?: string) {

		const loc = await this.world.fetchLoc(at);
		if (!loc?.chars.length) return undefined;

		const res: Char[] = [];
		const chars = loc.chars;
		for (let i = 0; i < chars.length; i++) {

			if (chars[i] == skipId) continue;

			const char = await this.loadChar(chars[i]);
			if (char?.isAlive()) {
				res.push(char);
			}

		}

		return res;

	}

	/**
	 * Get all targets at location that are affected by an action.
	 * @param char 
	 * @param flags 
	 * @param loc 
	 */
	async getTargets(char: TActor, flags: TargetFlags, loc: Loc) {

		const res: Record<string, TActor | undefined> = {};

		const party = char instanceof Char ? this.getParty(char) : undefined;

		if (flags & TargetFlags.enemies) {
			for (const m of loc.npcs) {

				if ((char.team & m.team) < 0) {
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

				if ((char.team & m.team) > 0) {
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

	craft(this: Game<A, K>, char: Char, itemName: string, desc?: string, imgURL?: string) {

		const ind = Craft(char, itemName, desc, imgURL);
		char.log(`${char.name} crafted ${itemName}. (${ind})`);

	}

	destroy(this: Game<A, K>, char: Char, first: string | number, end?: string | number | null) {

		if (end) {

			const items = char.removeRange(first, end);
			if (!items) return char.log('Invalid item range.');
			return char.log(items.length + ' items were destroyed.');

		} else {

			const item = char.removeItem(first);
			if (!item) {
				char.log(`'${first}' not in inventory.`);
				return;
			}
			char.log(item.name + ' is gone forever.');

		} //

	}

	async move(this: Game<A, K>, char: Char, dir: DirVal) {

		const from = await this.world.getOrGen(char.at);

		const toCoord = from.getExit(dir)?.to;
		if (!toCoord) {
			char.log(`There is no path ${ToDirStr(dir)}`);
			return;
		}

		const to = await this.world.move(char, from, toCoord);

		char.log(to.look(char));

		const p = this.getParty(char);
		if (p && p.leader === char.id) {
			await p.move(this.world, to);
		}

		// mobs chase?
		for (let i = from.npcs.length - 1; i >= 0; i--) {

			const npc = from.npcs[i];
			if (npc.evil < 0 && Math.random() < 0.1) {
				this.moveMob(from.npcs[i], from, to);
				char.log(`${npc.name} chases ${char.name}`);
			}

		}

	}

	getParty(char: Char) { return this._charParties[char.id]; }

	loadChar(charId: string) {
		return this.charCache.fetch(charId);
	}
	getChar(id: string) { return this.charCache.get(id) }

	/**
	 * Get list of currently loaded chars by id. no fetch.
	 * @param ids 
	 * @returns 
	 */
	getChars(ids: string[]) {
		const res: Char[] = [];
		for (let i = ids.length - 1; i >= 0; i--) {
			const c = this.charCache.get(ids[i]);
			if (c) res.push(c);
		}
		return res;
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
			if (!other.acceptInvite(char)) return `${other.getList()}\nYou have not been invited to ${other.leader}'s awesome party.`;

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
		char.log(await this.world.goHome(char));
	}

	compare(char: Char, wot: ItemIndex): string {

		const it = char.getItem(wot) as Item | undefined;
		if (!it) return 'Item not found.';

		let res = 'In Pack: ' + it.getDetails(char) + '\n';
		if ('slot' in it) {
			const eq = char.getEquip(it.slot as HumanSlot);

			if (!eq) res += 'Equip: nothing';
			else if (Array.isArray(eq)) res += 'Equip: ' + Item.DetailsList(eq);
			else res += 'Equip: ' + eq.getDetails(char);
		} else {
			res += `${it.name} cannot be equipped.\n`;
		}
		return res;

	}

	equip(this: Game<A, K>, char: Char, wot: ItemIndex) {

		if (char.equip(wot)) {
			char.log(`${char.name} equips ${wot}`);
		}

	}

	inscribe(this: Game<A, K>, char: Char, wot: ItemIndex, inscrip: string) {

		const item = char.getItem(wot) as Item | undefined;
		if (!item) return char.log('Item not found.');

		item.inscrip = inscrip;
		char.addHistory('inscribe');

		char.log(`${item.name} inscribed.`);

	}

	buy(this: Game<A, K>, char: Char, shop: Shop, item: ItemIndex) {
		shop.buy(char, item);
	}


	sell(this: Game<A, K>, char: Char, shop: Shop, ind: ItemIndex, end?: ItemIndex | null) {

		if (end) {
			shop.sellRange(char, ind, end);
		} else {
			shop.sell(char, ind)
		}

	}

	give(this: Game<A, K>, char: Char, dest: Char, what: string) {
		char.log(Trade.transfer(char, dest, what));

	}

	useLoc(char: Char, wot: ItemIndex) {
		return this.world.useLoc(this, char, wot);
	}

	unequip(this: Game<A, K>, char: Char, slot?: string) {

		if (!slot) {
			return char.log('Specify an equip slot to remove.');
		}

		const s = toSlot(slot);
		if (!s) {
			return char.log(`Invalid slot: ${slot}`);
		}

		if (char.unequip(s)) return char.log('Removed.');
		char.log('Cannot remove ' + s);

	}

	async drop(this: Game<A, K>, char: Char, what: ItemPicker, end?: ItemIndex | null) {
		char.log(await this.world.drop(char, what, end));

	}

	async take(this: Game<A, K>, char: Char, first: ItemIndex, end?: ItemIndex | null) {
		char.log(await this.world.take(char, first, end));
	}



	async rest(this: Game<A, K>, char: Char, factor: number = 1) {

		const p = this.getParty(char);
		if (p && p.isLeader(char)) {
			const pct = Math.round(await p.rest(factor));
			if (pct == 1) char.log(`${p.name} fully rested.`);
			else char.log(`${p.name} ${pct}% rested.`);

		} else {
			char.log(`${char.name} rested. hp: ${smallNum(char.hp)}/${smallNum(char.hp.max)}`);
		}

	}

	quaff(this: Game<A, K>, char: Char, wot: ItemIndex) {

		const p = char.getItem(wot) as Item | undefined;
		if (!p) {
			char.log(`Item ${wot} not found.`);
		}
		else if (!(p instanceof Potion)) {
			char.log(`${p.name} cannot be quaffed.`);
		} else {
			p.use(this, char);
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

	}

}