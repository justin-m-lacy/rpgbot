
import { HumanSlot, Wearable } from 'rpg/items/wearable';
import BaseArmors from '../data/items/armors.json';
import { Material } from '../items/material';

type RawArmorData = (typeof BaseArmors)[number];

const ArmorBySlot: Partial<{ [Property in HumanSlot]: RawArmorData[] }> = {};

export const GenArmor = (slot: HumanSlot | null = null, lvl: number = 0) => {

	const mat = Material.Random(lvl);
	if (mat === null) return null;

	let tmp;
	if (slot) {
		tmp = getRandSlot(slot, lvl);
	} else {
		const list = BaseArmors.filter((t: RawArmorData) => !t.level || t.level <= lvl);
		tmp = list[Math.floor(list.length * Math.random())];
	}

	if (!tmp) return;

	return Wearable.FromData(tmp, mat);

}

export function InitArmors() {

	for (let k = BaseArmors.length - 1; k >= 0; k--) {

		const armor = BaseArmors[k];
		const slot = armor.slot as HumanSlot;

		const list = ArmorBySlot[slot] ?? (ArmorBySlot[slot] = []);
		list.push(armor);

	}

}

const getRandSlot = (slot: HumanSlot, lvl: number = 0) => {

	const list = ArmorBySlot[slot]?.filter(t => !t.level || t.level <= lvl);
	if (!list || list.length === 0) return null;

	return list[Math.floor(list.length * Math.random())];

}


