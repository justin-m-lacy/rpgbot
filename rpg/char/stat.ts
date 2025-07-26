import { ParseMods } from "rpg/parsers/mods";
import { IMod } from "rpg/values/imod";
import { Path } from "rpg/values/paths";
import { Simple } from "rpg/values/simple";

export type StatDef = typeof import('data/char/stats.json')[number];
export const StatDefs: Record<string, typeof import('data/char/stats.json')[number]> = {};

export const StatIds = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
export type StatKey = typeof import('data/char/stats.json')[number]['id'];

export async function LoadStats() {

	const statData = (await import('data/char/stats.json')).default;
	for (const data of statData) {
		StatDefs[data.id] = data;
	}

}


export class Stat extends Simple {

	readonly name: string;
	readonly desc: string;

	/**
	 * Mods applied by stat.
	 * Don't confuse with mods applied to stat.
	 */
	readonly mod: Path<IMod>;

	constructor(def: StatDef) {

		super(def.id, 0);

		this.name = def.name ?? def.id;
		this.desc = def.desc ?? '';

		this.mod = ParseMods(def.mod, def.id, this);
	}

}