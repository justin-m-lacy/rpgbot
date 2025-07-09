import { randElm } from "@/utils/jsutils";
import { Actor } from "rpg/char/actor";
import { Char } from "rpg/char/char";
import { ActionFlags, TCombatAction } from "rpg/combat/types";
import { AttackInfo } from "rpg/events";
import { Game } from "rpg/game";
import { ItemPicker } from "rpg/inventory";
import { Item } from "rpg/items/item";
import { Spell } from "rpg/magic/spell";
import { Mob, TActor } from "rpg/monster/mobs";
import { PossPronoun } from "rpg/social/gender";
import { Party } from "rpg/social/party";
import { AddValues } from "rpg/values/apply";
import { Numeric, TValue } from "rpg/values/types";





/**
 * Handle combat for a single game context.
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

	async tryAttack(char: TActor, ark: TCombatAction, who: TActor | Party) {

		console.log(`${char.name} attacks ${who.name} with ${ark.name}`);

		const targ = who instanceof Party ? await who.randTarget() : who;
		if (!targ) return;

		if (!targ?.isAlive()) {
			(char instanceof Char ? char : targ).log(`${targ.name} is already dead.`);
		}

		(targ instanceof Char ? targ : char).send(
			`${char.name} attacks ${who.name} with ${ark.name}`
		);

		const hitroll = + char.toHit + (ark.tohit?.valueOf() ?? 0);
		if (hitroll < targ.armor.valueOf()) {

			(targ instanceof Char ? targ : char).send(`\n${char.name} misses!`);

		} else {

			this.doAttack(char, ark, targ);

		}



	}

	/**
	 * Apply combat action to target.
	 * @param char 
	 * @param act 
	 * @param targ 
	 */
	doAttack(char: TActor, act: TCombatAction, targ: Actor | Mob) {

		if (targ.isImmune(act.kind)) {
			char.log(`${targ.name} is immune to ${act.kind}`);
			return false;
		}

		//if (act.cure) { targ.cure(act.cure); }

		if (act.dot) {
			targ.addDot(act.dot, char.id);
		}
		if (act.add) {
			AddValues(targ, act.add, 1);
		}

		if (act.dmg) this.applyDmg(targ, act, char);
		if (act.heal) this.applyHealing(targ, act as TCombatAction & { heal: TValue }, char);

		(char instanceof Char ? char : targ).log(`${char.name} hits ${targ.name} with ${act.name}`);

		return true;
	}

	applyDmg(
		targ: TActor,
		attack: TCombatAction,
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

		this.game.events.emit('charHit', targ, attacker ?? attack.name, info);

		targ.updateState();
		if (!targ.isAlive()) {
			this.game.events.emit('charDie', targ, attacker ?? attack.name);
		}

	}

	/**
		 *
		 * @param wot - optional item to try to take.
		 */
	async trySteal(char: Char, who?: TActor | Party, wot?: ItemPicker | null) {

		const targ = who instanceof Party ? await who.randChar() : who;
		if (!targ) return;

		/// Mobs always have to be at same location to be targetted.
		if (!(char.at.equals(targ.at))) {

			char.log(`You not see ${targ.name} at your location.`);
			return;

		}

		let atk = char.statRoll('dex', 'wis');
		if (!char.hasTalent('steal')) atk -= 40;
		if (wot) atk -= 10;

		const def = targ.statRoll('dex', 'wis');
		const delta = atk - def;

		if (delta > 15) {

			this.doSteal(char, targ, wot, delta);

		} else if (delta < 5 && targ.isAlive()) {

			char.send(`${targ.name} catches ${char.name} attempting to steal.\n`);
			if (targ.attacks.length) {
				await this.tryAttack(targ, randElm(targ.attacks), char);
			}

		} else {
			char.log(`You failed to steal from ${targ.name}`);
		}

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

			it = targ.takeItem(wot);
			if (!it) {
				src.log(`You try to rob ${targ.name}, but could not find the item you wanted.`);
				return;
			}

		} else it = targ.randItem();

		if (it) {

			const ind = src.addItem(it);
			src.log(`${src.name} stole ${it.name} from ${targ.name}. (${ind})`);

			if (src instanceof Char) {
				src.addHistory('stolen');
				src.addExp(2 * +targ.level);
			}

		} else {
			src.log(`${src.name} attempts to steal from ${targ.name} but ${PossPronoun((src as any).sex)} pack is empty.`);
		}

	}


	async trySpellHit(src: Char | Mob, targ: TActor, spell: Spell, srcParty?: Party) {

		src.log(`${src.name} casts ${spell.name} at ${targ.name}`);

		if (this.rollSpellHit(src, targ)) {

		} else {

		}

	}

	rollSpellHit(src: Char | Mob, targ: TActor) {

		/// todo: some bs formula.
		const roll = (src.statRoll('int') + src.toHit) * Math.random();
		if (roll > (targ.level.valueOf() + targ.statRoll())) {
			return true;
		} else {
			return false;
		}

	}

	applyHealing(target: TActor, attack: TCombatAction & { heal: Numeric }, attacker?: TActor) {

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
	calcDamage(dmg: Numeric, attack: TCombatAction, attacker?: TActor, target?: TActor) {
		return dmg.valueOf();
	}

}



