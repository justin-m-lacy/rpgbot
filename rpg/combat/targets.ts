import { Char } from "rpg/char/char";
import { Monster } from "rpg/monster/monster";

export const ParseTarget = (s: keyof typeof ActTarget) => {
	return ActTarget[s] ?? ActTarget.none;
}

export enum ActTarget {
	none = 0,
	self = 1,
	any = 2,
	allies = 4,
	enemies = 8,
	all = ActTarget.allies | ActTarget.enemies

}

export const CanTarget = (char: Char | Monster, targ: Char | Monster, types: ActTarget) => {

	if (types & ActTarget.self) {
		return char.id === targ.id;
	}

	return true;

}