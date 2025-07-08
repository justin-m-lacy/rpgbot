import { Char } from "rpg/char/char";
import { CombatActor, TCombatAction } from "rpg/combat/types";
import { Spell } from "rpg/magic/spell";
import { Mob, TActor } from "rpg/monster/monster";
import { Party } from "rpg/social/party";
import { Numeric } from "rpg/values/types";
import { Loc } from "rpg/world/loc";

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