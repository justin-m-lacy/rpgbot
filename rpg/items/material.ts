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
	priceMod?: number;

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


export const LoadMaterials = () => {

	if (materials != null) return;


	const objs = require('../data/items/materials.json');
	materials = [];
	byName = {};
	byLevel = {};

	for (let i = objs.length - 1; i >= 0; i--) {

		const m = objs[i];

		m.name ??= m.id;
		byName[m.id] = byName[m.name] = m;
		AddToLevel(m, m.level);

		materials.push(m);

	}

}

const AddToLevel = (mat: Material, lvl: number = 0) => {

	if (lvl === null) lvl = 0;

	let list = byLevel[lvl];
	if (!list) {
		byLevel[lvl] = list = [];
	}

	list.push(mat);

}