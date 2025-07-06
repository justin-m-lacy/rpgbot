import { Char } from "rpg/char/char";
import { Monster } from "rpg/monster/monster";

export const ParseTarget = (s: keyof typeof TargetFlags) => {
	return TargetFlags[s] ?? TargetFlags.none;
}

export enum TargetFlags {
	none = 0,
	self = 1,
	enemy = 2,
	ally = 4,

	/// used to mark any TargetFlag that can affect multiple chars.
	mult = 8,
	enemies = 16 + TargetFlags.mult,
	allies = 32 + TargetFlags.mult,
	all = 64 + TargetFlags.mult,

	random = 128,
}

export const CanTarget = (char: Char | Monster, targ: Char | Monster, types: TargetFlags) => {

	if (types & TargetFlags.self) {
		return char.id === targ.id;
	}

	return true;

}