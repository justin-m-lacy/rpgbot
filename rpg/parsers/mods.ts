import type { IMod } from "rpg/values/imod";
import { IsAtMod, parseAtMod } from "rpg/values/mods/atmod";
import { BaseMod } from "rpg/values/mods/base-mod";
import { PctMod } from "rpg/values/mods/pct-mod";
import { IsPerMod, PerMod } from "rpg/values/mods/per-mod";
import type { Id, Numeric } from "rpg/values/types";

/// +D+P%
export const ModTest = /^([\+\-]?\d+\.?\d*\b)?(?:([\+\-]?\d+\.?\d*)\%)?$/;


class InvalidModData extends Error {

	constructor(str: any, source?: Id) {

		super(`${source?.toString()}: Invalid Mod Str: ${str}`);

	}

}

class NaNError extends Error {

	readonly value: unknown;
	readonly source?: Id;

	constructor(v: unknown, source?: Id) {
		super(`${source?.toString()}: Value is NaN: ${v}`);
		this.value = v;
		this.source = source;
	}

}

/*export const ParseMods = (mods: Record<string, any>, id: string, src: Numeric = 1) => {
	return ParsePaths(
		mods,
		'mod',
		(path, orig) => ParseMod(
			JoinPath(id, 'mod', path), orig, src)!
	);
}*/

export const ParseMod = (id: string, mod: string | number | boolean | undefined | null,
	src: Numeric): IMod | undefined => {

	if (typeof mod === 'string') return StrMod(id, mod, src);
	if (typeof mod === 'number') return parseBaseMod(id, mod, src);
	return undefined;

}

/**
 * An alter mod has count set to '1' because it isn't multiplied
 * by the count of the source.
 * @param id 
 * @param mod 
 * @param src 
 * @returns 
 */
export const ParseAlter = (id: string, mod: string | number | boolean, src: Numeric): IMod | undefined => {

	if (typeof mod === 'string') return StrMod(id, mod, 1);
	if (typeof mod === 'number') return parseBaseMod(id, mod, 1);
	return undefined;

}

/**
 * Parse a string source into a Mod class.
 * @param modStr - mod str.
 * @param id - mod id.
 * @param src - mod source.
 * @returns {Mod|string}
 */
export const StrMod = (id: string, modStr: string, src: Numeric): IMod | undefined => {

	if (ModTest.test(modStr)) return parseBaseMod(id, modStr, src);
	if (IsPerMod(modStr)) return new PerMod(id, modStr, src);
	else if (IsAtMod(modStr)) return parseAtMod(id, modStr, src)

	return undefined;

}

const parseBaseMod = (id: Id, v: number | string, source?: Numeric) => {

	if (typeof v === 'number') {
		return new BaseMod(id, v, source);
	}
	if (typeof v === 'string') {

		const res = ModTest.exec(v);
		if (res) {

			let bonus = 0, pct = 0;

			if (res.length === 3) {
				bonus = Number(res[1] ?? 0);
				pct = Number(res[2] ?? 0) / 100;
			}

			if (isNaN(bonus) || isNaN(pct)) throw new NaNError(v, id);

			return new PctMod(id, { bonus, pct }, source);

		}

	}

	throw new InvalidModData(v, id);
}