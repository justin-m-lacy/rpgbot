import { ParseStateFlags, StatusFlag } from "rpg/char/states"
import { GetOrParseDots, ProtoDot } from "rpg/effects/dots"
import { ParseMods } from "rpg/parsers/mods"
import { IMod } from "rpg/values/imod"
import { Path } from "rpg/values/paths"

// could be expanded to encompass race/class?
export type CharProp = {

	id: string,
	/**
	 * rename applied to base object.
	 */
	rename: string,
	flags: number,
	mod?: Path<IMod>,
	dots?: ProtoDot[]


}

export const ParseCharProp = (data: any): CharProp => {

	return {
		id: data.id,
		rename: data.rename,
		flags: data.flags ? ParseStateFlags(data.flags) : StatusFlag.none,
		dots: data.dots ? GetOrParseDots(data.dots) : undefined,
		mod: data.mod ? ParseMods(data.mods, data.id, 1) : undefined
	}


}