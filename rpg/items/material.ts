import { IMod } from "rpg/values/imod";

let materials: Material[];
let byName: { [name: string]: Material };

// materials in lists by level.
let byLevel: { [level: number]: Material[] | undefined };

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
	alter: Record<string, IMod>

}


export const RandMaterial = (maxLevel?: number) => {

	if (maxLevel && !Number.isNaN(maxLevel)) {

		let list;
		while (maxLevel >= 0) {

			list = byLevel[maxLevel];
			if (list && list.length > 0) return list[Math.floor(list.length * Math.random())];
			console.log(maxLevel + ' material list is null');
			maxLevel--;

		}

		return null;

	}

	return materials[Math.floor(materials.length * Math.random())];

}

export const GetMaterial = (name: string) => {
	return byName[name];
}


export const LoadMaterials = async () => {

	if (materials != null) return;


	const objs = (await import('data/items/materials.json', { assert: { type: 'json' } })).default;
	materials = [];
	byName = {};
	byLevel = {};

	for (let i = objs.length - 1; i >= 0; i--) {

		const m = objs[i] as any;

		m.name ??= m.id;
		m.only = m.only?.split(',');
		m.exclude = m.exclude?.split(',');

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