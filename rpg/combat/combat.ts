import { Char } from "rpg/char/char";
import { ActionFlags, CombatActor, TCombatAction } from "rpg/combat/types";
import { Spell } from "rpg/magic/spell";
import { Monster, Npc } from "rpg/monster/monster";
import { Party } from "rpg/social/party";
import { Numeric } from "rpg/values/types";
import { Loc } from "rpg/world/loc";

export const HasEnemies = (c: Char, loc: Loc) => {

	return loc.npcs.some(v => (v.team & c.team) == 0);

}

export const TrySpellHit = async (src: Char | Monster, targ: Npc, spell: Spell, srcParty?: Party) => {

	src.log(`${src.name} casts ${spell.name} at ${targ.name}`);

	if (RollSpellHit(src, targ)) {

	} else {

	}

}

const RollSpellHit = (src: Char | Monster, targ: Npc) => {

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
export const TryAction = (char: Char, act: TCombatAction, targ: Char | Monster) => {

}

export const ApplyDmg = (
	targ: Npc,
	attack: TCombatAction,
	attacker?: Npc) => {

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
		/*gevents.emit(
			'charDied',
			ctx,
			targ,
			attack,
			(targ.friends & (ctx as TChar).friends) === 0);*/
	}

	if (attack.leech && attacker && dmg > 0) {
		let amt = Math.floor(100 * Number(attack.leech) * dmg) / 100;
		attacker.hp.value += amt;

		//gevents.emit('combat', ctx, targ, attacker, attacker.name + ' Steals ' + amt + ' Life');
	}

}
export const ApplyHealing = (target: Npc, attack: TCombatAction & { heal: Numeric }, attacker?: Npc) => {

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
const CalcDamage = (dmg: Numeric, attack: TCombatAction, attacker?: Npc, target?: Npc) => {
	return dmg.valueOf();
}
