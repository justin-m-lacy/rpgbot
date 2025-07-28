import { Char } from "rpg/char/char";
import { Mob } from "rpg/char/mobs";

export const ParseTarget = (s?: string) => {

	if (!s) return TargetFlags.enemies;
	const parts = s.split(',');
	let f = 0;
	for (let i = parts.length - 1; i >= 0; i--) {
		f |= (TargetFlags[parts[i] as any] as any as number ?? TargetFlags.none)
	}
	return f;
}

export enum TargetFlags {
	none = 0,
	self = 1,
	enemy = 2,
	ally = 4,

	enemies = 8,
	allies = 16,

	all = 32,

	/// any single not caster.
	other = 64,

	others = 128,

	/// used to mark any target that affects multiple chars.
	mult = enemies | allies | others | all,

	harmless = self | ally | allies,

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