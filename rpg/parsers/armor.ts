
import { AddProtoItem } from 'rpg/builders/itemgen';
import { Item } from 'rpg/items/item';
import { ItemData } from 'rpg/items/types';
import { HumanSlot, Wearable } from 'rpg/items/wearable';
import BaseArmors from '../data/items/armors.json';
import { Material } from '../items/material';

type RawArmorData = ItemData & (typeof BaseArmors)[number];

const ArmorBySlot: Partial<{ [Property in HumanSlot]: RawArmorData[] }> = {};


export const DecodeWearable = (json: any) => {

	const a = new Wearable(json.id, json.name, json.desc);
	a.material = json.material;
	a.slot = json.slot;
	a.armor = json.armor;

	if (json.mods) a.mods = json.mods;

	return Item.InitData(json, a);
}

export const GenArmor = (slot: HumanSlot | null = null, lvl: number = 0) => {

	const mat = Material.Random(lvl);
	if (mat === null) return null;

	let tmp;
	if (slot) {
		tmp = getRandSlot(slot, lvl);
	} else {
		const list = (BaseArmors as RawArmorData[]).filter((t: RawArmorData) => !t.level || t.level <= lvl);
		tmp = list[Math.floor(list.length * Math.random())];
	}

	if (!tmp) return;

	return Wearable.FromData(tmp, mat);

}

export function InitArmors() {

	for (let k = BaseArmors.length - 1; k >= 0; k--) {

		const armor = BaseArmors[k] as any as RawArmorData;
		armor.name ??= armor.id;

		AddProtoItem(armor);

		/// save by slot.
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


