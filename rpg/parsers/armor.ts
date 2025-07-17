
import BaseArmors from 'data/items/armors.json';
import { AddProtoItem } from 'rpg/builders/itemgen';
import { Item } from 'rpg/items/item';
import { RandMaterial } from 'rpg/items/material';
import { ItemData } from 'rpg/items/types';
import { HumanSlot, Wearable } from 'rpg/items/wearable';
import { ParseMods } from 'rpg/parsers/mods';

type RawArmorData = ItemData & (typeof BaseArmors)[number];

const ArmorBySlot: Partial<{ [Property in HumanSlot]: RawArmorData[] }> = {};


export const ReviveWearable = (json: any) => {

	const a = new Wearable(json.id, json.name, json.desc);
	a.material = json.material;
	a.slot = json.slot;
	a.armor = json.armor;

	if (json.mods) {
		console.log(`wear mods: ${json.mods}`);
		a.mods = ParseMods(json.mods, a.id);
	}

	return Item.InitData(json, a);
}

export const GenArmor = (lvl: number = 0, slot?: HumanSlot | null) => {

	lvl = Math.floor(lvl);
	const mat = RandMaterial(lvl);

	let tmp;
	if (slot) {
		tmp = getRandSlot(slot, lvl);
	} else {
		const list = (BaseArmors as RawArmorData[]).filter((t: RawArmorData) => !t.level || t.level <= lvl);
		tmp = list[Math.floor(list.length * Math.random())];
	}

	if (!tmp) return null;

	return Wearable.FromTemplate(tmp, mat);

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


