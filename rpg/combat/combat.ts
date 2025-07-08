import { Actor } from "rpg/char/actor";
import { Char } from "rpg/char/char";
import { ActionFlags, CombatActor, TCombatAction } from "rpg/combat/types";
import { Game } from "rpg/game";
import { Spell } from "rpg/magic/spell";
import { Mob, TActor } from "rpg/monster/monster";
import { Party } from "rpg/social/party";
import { AddValues } from "rpg/values/apply";
import { Numeric, TValue } from "rpg/values/types";
import { Loc } from "rpg/world/loc";


/**
 * Handles all combat for a single game context.
 */
export class Combat {

	private readonly game: Game;

	constructor(game: Game) {

		this.game = game;

	}


	/**
	 * Apply combat action to target.
	 * @param char 
	 * @param act 
	 * @param targ 
	 */
	applyAction(char: Char, act: TCombatAction, targ: Actor | Mob, at: Loc) {

		if (!targ?.isAlive()) return false;
		if (targ.isImmune(act.kind)) return false;

		console.log(`apply spell: ${act.dmg?.valueOf()}`);

		if (act.dmg) this.applyDmg(targ, act, char);
		if (act.heal) ApplyHealing(targ, act as TCombatAction & { heal: TValue }, char);

		//if (act.cure) { targ.cure(act.cure); }

		if (act.dot) {
			targ.addDot(act.dot);
			if (targ instanceof Mob) this.game.setLiveLoc(at);
		}
		if (act.add) {
			AddValues(targ, act.add, 1);
		}

		return true;
	}

	applyDmg(
		targ: TActor,
		attack: TCombatAction,
		attacker?: TActor) {

		let dmg = CalcDamage(attack.dmg ?? 0, attack, attacker, targ);

		let resist = targ.getResist(attack.kind);
		if (resist !== 0) {
			dmg *= (1 - Math.min(resist / 100, 1));

		}

		let dmg_reduce = 0
		if (resist < 1 && !((attack?.actFlags ?? 0) & ActionFlags.nodefense)) {

			//dmg_reduce = (targ.defense?.valueOf() ?? 0) / ((targ.defense?.valueOf() ?? 0) + dmg);
			//dmg -= dmg_reduce * dmg;

		}

		const parried = 0;
		if (parried) dmg *= parried;
		targ.hp.value += (-dmg);

		/*gevents.emit('charHit', ctx, {
			target: targ,
			attacker: attack,
			dmg,
			resist,
			reduced: dmg_reduce,
			parried
		});*/

		if (targ.hp.value <= 0) {
			targ.updateState();
			if (targ instanceof Char) {
				this.game.events.emit('charDie', targ, attacker);
			} else if (targ instanceof Mob) {
				this.game.events.emit('mobDie', targ, attacker);
			}
		}


		if (attack.leech && attacker && dmg > 0) {
			const amt = Math.floor(100 * Number(attack.leech) * dmg) / 100;
			attacker.hp.value += amt;
			//gevents.emit('combat', ctx, targ, attacker, attacker.name + ' Steals ' + amt + ' Life');
		}

	}

}

export const HasEnemies = (c: Char, loc: Loc) => {

	return loc.npcs.some(v => (v.team & c.team) == 0);

}

export const TrySpellHit = async (src: Char | Mob, targ: TActor, spell: Spell, srcParty?: Party) => {

	src.log(`${src.name} casts ${spell.name} at ${targ.name}`);

	if (RollSpellHit(src, targ)) {

	} else {

	}

}

const RollSpellHit = (src: Char | Mob, targ: TActor) => {

	/// todo: some bs formula.
	const roll = (src.statRoll('int') + src.toHit) * Math.random();
	if (roll > (targ.level.valueOf() + targ.statRoll())) {
		return true;
	} else {
		return false;
	}

}


export const TryAttack = (char: Char, targ: CombatActor) => {

}

/**
 * Attempt to apply action to target.
 * @param char 
 * @param act 
 * @param targ 
 */
export const TryAction = (char: Char, act: TCombatAction, targ: Char | Mob) => {

}

export const ApplyHealing = (target: TActor, attack: TCombatAction & { heal: Numeric }, attacker?: TActor) => {

	target.hp.value += (CalcDamage(attack.heal, attack, attacker, target));

}

/**
 * TODO: more complex damage bonuses.
 * @param dmg 
 * @param attack 
 * @param attacker 
 * @param target 
 * @returns 
 */
export const CalcDamage = (dmg: Numeric, attack: TCombatAction, attacker?: TActor, target?: TActor) => {
	return dmg.valueOf();
}