import { Char } from "rpg/char/char";
import { Mob } from "rpg/monster/mobs";

export const ParseTarget = (s: keyof typeof TargetFlags) => {
	return TargetFlags[s] ?? TargetFlags.none;
}

export enum TargetFlags {
	none = 0,
	self = 1,
	enemy = 2,
	ally = 4,

	/// used to mark any target that affects multiple chars.
	mult = 8,
	enemies = 16 + mult,
	allies = 32 + self + mult,

	/// anyone not caster.
	others = 64 + mult,

	all = 128 + enemy | ally | mult,
	any = self | enemy | ally,

	random = 256,

	/// location based spell.
	loc = 512
}

/**
 * Given a char team mask, and target flags, return a team mask
 * that be AND'd with target's mask to determine target inclusion.
 * e.g. if TargetFlags == enemies,
 * 		mask = (~char.team)
 * 		select all enemies: (enemy & mask)>0
 * @param team 
 * @param flags 
 */
const GetTargetMask = (team: number, flags: TargetFlags) => {

}

export const CanTarget = (char: Char | Mob, targ: Char | Mob, types: TargetFlags) => {

	if (types & TargetFlags.self) {
		return char.id === targ.id;
	}

	return true;

}