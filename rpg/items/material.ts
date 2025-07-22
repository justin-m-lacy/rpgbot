import { ParseMods } from "rpg/parsers/mods";
import { IMod } from "rpg/values/imod";
import { Path } from "rpg/values/paths";

const materials: Material[] = [];
const byName: { [name: string]: Material } = {};

// materials in lists by level.
const byLevel: { [level: number]: Material[] | undefined } = {};

// arrays of materials by type, e.g. cloth, metal, etc.
//var byType;

export type Material = {

	id: string;
	name: string;
	level: number;
	bonus?: number;
	dmg?: number;
	only?: string[],
	exclude?: string[],
	alter: Path<IMod>

}


export const RandMaterial = (maxLevel?: number) => {

	if (typeof maxLevel === 'number' && !Number.isNaN(maxLevel)) {

		while (maxLevel >= 0) {

			const list = byLevel[maxLevel];
			if (list?.length) return list[Math.floor(list.length * Math.random())];
			maxLevel--;

		}

		return undefined;

	}

	return materials[Math.floor(materials.length * Math.random())];

}

export const GetMaterial = (id: string) => {
	return byName[id];
}


export const LoadMaterials = async () => {

	materials.length = 0;

	const objs = (await import('data/items/materials.json', { assert: { type: 'json' } })).default;

	for (let i = objs.length - 1; i >= 0; i--) {

		const raw = objs[i] as any;

		raw.name ??= raw.id;
		raw.only = raw.only?.split(',');
		raw.exclude = raw.exclude?.split(',');

		if (raw.alter) {
			raw.alter = ParseMods(raw.alter, 'alter');
		}

		byName[raw.id] = byName[raw.name] = raw;
		AddToLevel(raw, raw.level);

		materials.push(raw);

	}

	return materials;

}

const AddToLevel = (mat: Material, lvl: number = 0) => {

	lvl = lvl || 0;

	let list = byLevel[lvl];
	if (!list) {
		byLevel[lvl] = list = [];
	}

	list.push(mat);

}