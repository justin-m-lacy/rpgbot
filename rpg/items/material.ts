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

	console.log(`mat length: ${materials.length}`);
	if (typeof maxLevel === 'number' && !Number.isNaN(maxLevel)) {

		while (maxLevel >= 0) {

			const list = byLevel[maxLevel];
			if (list?.length) return list[Math.floor(list.length * Math.random())];
			console.log(maxLevel + ' material list null');
			maxLevel--;

		}

		return undefined;

	}

	return materials[Math.floor(materials.length * Math.random())];

}

export const GetMaterial = (name: string) => {
	return byName[name];
}


export const LoadMaterials = async () => {

	const objs = (await import('data/items/materials.json', { assert: { type: 'json' } })).default;

	console.log(`materials count: ${objs.length}`);

	for (let i = objs.length - 1; i >= 0; i--) {

		const m = objs[i] as any;

		m.name ??= m.id;
		m.only = m.only?.split(',');
		m.exclude = m.exclude?.split(',');

		if (m.alter) {
			m.alter = ParseMods(m.alter, 'alter');
		}

		byName[m.id] = byName[m.name] = m;
		AddToLevel(m, m.level);

		materials.push(m);

	}

}

const AddToLevel = (mat: Material, lvl: number = 0) => {

	lvl = lvl || 0;

	let list = byLevel[lvl];
	if (!list) {
		byLevel[lvl] = list = [];
	}

	list.push(mat);

}