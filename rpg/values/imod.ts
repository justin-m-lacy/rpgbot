import type { Path } from "rpg/values/paths";
import type { Id, TValue } from "rpg/values/types";

export const SymModdable = Symbol('Moddable');
export const SymMod = Symbol('Mod');

export type ModState = {
	bonus: number,
	pct: number,
	pctMult: number,
}

export const IsMod = (v: any): v is IMod => {
	return v && typeof v === 'object' && v[SymMod] === true;
}

export interface IMod {

	readonly id: Id;

	readonly order?: number;

	readonly [SymMod]: true;

	applyMod(orig: object, state: ModState): void;

}

/**
 * Defines Mods for Moddable properties of an object.
 * @param D - target of mods
 */
export type ModBlock<D extends object> = {
	[K in keyof Partial<D>]: D[K] extends IModdable ? IMod : never
}

//Record<keyof D, IMod>;

/// object handles addMod() and removeMod()
export interface IModdable extends TValue {

	[SymModdable]: true,

	id: string;
	base: number;

	addMod(mod: IMod): void;
	removeMod(mod: IMod): void;

}

export const CanMod = (it: any | null | undefined): it is IModdable => {
	return it != null && typeof it === 'object' && it[SymModdable] == true;
}

/**
 * Interface for objects that apply a path of mods to its subitems.
 */
export interface IApplyMods {
	applyMods(mods: Path<IMod>): void;
	removeMods(mods: Path<IMod> | IMod): void;
}

export const CanApplyMods = (it: object): it is IApplyMods => {
	return typeof (it as any).applyMods === 'function';
}