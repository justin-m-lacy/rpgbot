import { Spell } from "rpg/actions/spell.js";
import { Char } from "rpg/char/char";
import { Mob, TActor } from "rpg/char/mobs";
import { ActionFlags, TNpcAction } from "rpg/combat/types";
import { AttackInfo } from "rpg/events";
import { Game } from "rpg/game";
import { ItemPicker } from "rpg/items/inventory.js";
import { Item } from "rpg/items/item";
import { GenMob } from "rpg/parsers/mobs";
import { PossPronoun } from "rpg/social/gender";
import { Party } from "rpg/social/party";
import { AddValues } from "rpg/values/apply";
import { Numeric, TValue } from "rpg/values/types";
import { Loc } from "rpg/world/loc";


/**
 * Handle combat for a single game context.
 * Mostly organizational make Game class smaller.
 */
export class Combat {

	private readonly game: Game;

	constructor(game: Game) {
		this.game = game;
	}

	/**
	 * Exp for killing target.
	 * @param lvl
	 */
	npcExp(lvl: number) { return Math.floor(10 * Math.pow(1.3, lvl)) };
	pvpExp(lvl: number) { return Math.floor(10 * Math.pow(1.2, lvl / 2)) };

	/**
	 * Test if one character can see a hiding character.
	 * @param hider
	 * @param looker 
	 * @param mod - extra modifier for hider
	 */
	spotTest(hider: Char, looker: TActor, mod: number = 0) {

		const def = hider.statRoll('dex', 'wis') + (hider.hasTalent('sneak') ? 10 : 0) + mod;
		const atk = looker.statRoll('wis') + (looker.hasTalent('track') ? 10 : 0);
		return Math.random() * atk > Math.random() * def;

	}

	private async tryAttack(char: TActor, atk: TNpcAction | null | undefined,
		targ: TActor): Promise<boolean> {

		if (!atk) return false;

		console.log(`${char.name} attacks ${targ.name} with ${atk.name}`);


		if (!targ?.isAlive()) {
			char.log(`${targ.name} is already dead.`);
			return false;
		}

		this.game.setLiveLoc(char.at);

		const hitroll = + char.tohit + (atk.tohit?.valueOf() ?? 0);
		if (hitroll < targ.armor.valueOf()) {

			await this.game.send(char, `${char.name} attacks ${targ.name} with ${atk.name} and misses!`);
			return false;

		} else {

			this.doAttack(char, atk, targ);
			return true;

		}


	}

	async doAction(char: TActor, act: TNpcAction, targ: TActor | TActor[]) {

		if (act.summon) {
			for (let i = act.summon.length - 1; i >= 0; i--) {
				const mob = GenMob(act.summon[i]);
				if (mob && !(char as Char).minions.some(c => c.id == mob.id)) {
					(char as Char).minions.push(mob);
				}
			}

		}

		if (Array.isArray(targ)) {
			await Promise.all(targ.map(v => this.applyTarget(char, act, v)));
		} else {
			await this.applyTarget(char, act, targ);
		}

		if (act.add) {
			AddValues(char, act.add, 1);
		}

		return true;
	}

	/**
	 * Apply result of action to single target.
	 * @param char 
	 * @param act 
	 * @param targ 
	 */
	private async applyTarget(char: TActor, act: TNpcAction, targ: TActor) {

		if (!char.at.equals(targ.at)) {
			char.log(`You not see ${targ.name} at your location.`);
			return;
		}

		if (act.dot) {
			targ.addDot(act.dot, char.id);
		}
		if (act.cure) {
			targ.flags.unset(act.cure);
		}
		if (act.heal) this.applyHealing(targ, act as TNpcAction & { heal: TValue }, char);

		if (act.dmg) {
			await this.tryAttack(char, act, targ);
		}

	}

	/**
	 * Apply combat action to target.
	 * @param char 
	 * @param act 
	 * @param targ 
	 */
	private doAttack(char: TActor, act: TNpcAction, targ: TActor) {

		if (targ.isImmune(act.kind)) {
			char.log(`${targ.name} is immune to ${act.kind}`);
			return false;
		}

		if (targ instanceof Mob) {
			this.game.likeStore.action(targ, char, 10, act.target);
		}

		/// todo: need to log if non-damage event from combat.
		if (act.dmg) this.applyDmg(targ, act, char);

		return true;
	}

	applyDmg(
		targ: TActor,
		attack: TNpcAction,
		attacker?: TActor) {

		const info: AttackInfo = {
			dmg: 0,
			name: attack.name
		};

		let dmg = this.calcDamage(attack.dmg ?? 0, attack, attacker, targ);

		const resist = targ.getResist(attack.kind);
		if (resist !== 0) {
			info.resist = dmg * Math.min(resist / 100, 1);
			dmg -= info.resist;

		}

		if (resist < 1 && !((attack?.actFlags ?? 0) & ActionFlags.nodefense)) {

			//dmg_reduce = (targ.defense?.valueOf() ?? 0) / ((targ.defense?.valueOf() ?? 0) + dmg);
			//dmg -= dmg_reduce * dmg;

		}

		if (info.parried) dmg *= info.parried;


		if (attack.leech && attacker && dmg > 0) {
			info.leech = Math.floor(100 * Number(attack.leech) * dmg) / 100;
			attacker.hp.value += info.leech;
		}

		targ.hp.value += (-dmg);
		info.dmg = dmg;

		targ.updateState();

		this.game.events.emit('charHit', targ, attacker ?? attack.name, info);
		if (!targ.isAlive()) {
			this.game.events.emit('charDie', targ, attacker ?? attack.name);
		}

	}

	/**
	* @param wot - optional item to try to take.
	*/
	async trySteal(char: Char, who: TActor | Party, wot?: ItemPicker | null): Promise<boolean> {

		const targ = who instanceof Party ? await who.randChar() : who;
		if (!targ) return false;

		/// Mobs always have to be at same location to be targetted.
		if (!(char.at.equals(targ.at))) {

			char.log(`You not see ${targ.name} at your location.`);
			return false;

		}

		let atk = char.statRoll('dex', 'wis');
		if (!char.hasTalent('steal')) atk -= 40;
		if (wot) atk -= 10;

		const def = targ.statRoll('dex', 'wis');
		const delta = atk - def;

		if (delta > 15) {

			this.doSteal(char, targ, wot, delta);
			return true;

		} else if (delta < 5 && targ.isAlive()) {

			await this.game.send(char, `${targ.name} catches ${char.name} attempting to steal.\n`);
			await this.tryAttack(targ, targ.getAttack(), char);

		} else {
			char.log(`You failed to steal from ${targ.name}`);
		}
		return false;

	}

	/**
	 * 
	 * @param src 
	 * @param targ 
	 * @param wot 
	 * @param stealRoll - TODO: influence quality of item.
	 * @returns 
	 */
	private doSteal(src: TActor, targ: TActor, wot?: ItemPicker | null, stealRoll: number = 0) {

		let it: Item | null | undefined;
		if (wot) {

			it = targ.removeItem(wot);
			if (!it) {
				src.log(`You try to rob ${targ.name}, but could not find the item you wanted.`);
				return;
			}

		} else it = targ.randItem();

		if (it) {

			const ind = src.addItem(it);
			src.log(`${src.name} stole ${it.name} from ${targ.name}. (${ind})`);

			if (src instanceof Char) {
				src.addHistory('stole');
				src.addExp(2 * +targ.level);
			}

		} else {
			src.log(`${src.name} attempts to steal from ${targ.name} but ${PossPronoun((src as any).sex)} pack is empty.`);
		}

	}


	private async trySpellHit(src: Char | Mob, targ: TActor, spell: Spell, srcParty?: Party) {

		src.log(`${src.name} casts ${spell.name} at ${targ.name}`);

		if (this.rollSpellHit(src, targ)) {

		} else {

		}

	}

	private rollSpellHit(src: Char | Mob, targ: TActor) {

		/// todo: some bs formula.
		const roll = (src.statRoll('int') + src.tohit) * Math.random();
		if (roll > (targ.level.valueOf() + targ.statRoll())) {
			return true;
		} else {
			return false;
		}

	}

	/**
	 * Run npc actions at location.
	 * @param loc 
	 * @returns 
	 */
	async doNpcActions(loc: Loc, npcs: TActor[], targs: TActor[]) {

		for (let i = loc.chars.length - 1; i >= 0; i--) {

			const c = this.game.getChar(loc.chars[i]);
			if (!c?.isAlive()) continue;
			for (const k in c.minions) {
				targs.push(c.minions[k]);
			}

			targs.push(c);

		}

		if (targs.length == 0) return 0;

		targs.push(...loc.npcs);

		for (let i = loc.npcs.length - 1; i >= 0; i--) {

			const npc = loc.npcs[i];
			if (!npc.isAlive() || !npc.attacks.length) continue;
			const targ = this.findNpcTarg(npc, targs);
			if (targ) {
				this.doNpc(npc, targ);
			}

		}

	}

	/**
	 * Pick a target for npc to act on.
	 * @param npc 
	 * @param targs 
	 */
	private findNpcTarg(npc: Mob, targs: TActor[]) {

		const len = targs.length;
		const start = Math.floor(Math.random() * targs.length);
		let ind = start;
		do {

			if (targs[ind].isAlive() && this.game.likeStore.getOpinion(npc, targs[ind])) {
				return targs[ind];
			}
			ind = (ind + 1) % len;

		} while (ind != start);
		return null;

	}

	/**
	 * Run npc actions.
	 * @param npc 
	 * @param targs - all potential targets at location.
	 */
	private async doNpc(npc: TActor, targ: TActor) {

		await this.tryAttack(npc, npc.getAttack(), targ);

		// reverse attack.
		if (targ.isAlive()) {
			await this.tryAttack(targ, targ.getAttack(), npc);
		}

	}


	private applyHealing(target: TActor,
		attack: TNpcAction & { heal: Numeric },
		attacker?: TActor) {

		target.hp.value += this.calcDamage(attack.heal, attack, attacker, target);

	}

	/**
	 * TODO: more complex damage bonuses.
	 * @param dmg 
	 * @param attack 
	 * @param attacker 
	 * @param target 
	 * @returns 
	 */
	private calcDamage(dmg: Numeric, attack: TNpcAction, attacker?: TActor, target?: TActor) {
		return dmg.valueOf();
	}

}



