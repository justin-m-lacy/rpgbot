
import BaseArmors from 'data/items/armors.json';
import { AddProtoItem, GetProto } from 'rpg/builders/itemgen';
import { Item } from 'rpg/items/item';
import { GetMaterial, RandMaterial } from 'rpg/items/material';
import { ItemData } from 'rpg/items/types';
import { Weapon } from 'rpg/items/weapon';
import { HumanSlot, Wearable } from 'rpg/items/wearable';
import { ParseMods } from 'rpg/parsers/mods';
import { RawWeaponData } from 'rpg/parsers/weapon';

export type RawWearableData = ItemData & (typeof BaseArmors)[number] & {

	mods?: Record<string, any>,
	hit?: number,
	dmg?: number | string
};

const ArmorBySlot: Partial<{ [Property in HumanSlot]: RawWearableData[] }> = {};



export const ReviveWeapon = (json: ItemData & {
	slot?: HumanSlot, hit?: number, kind?: string,
	proto?: string,
	material?: string,
	mat?: string,
	mods: any, dmg: any
}) => {

	const mat = json.mat ?? json.material ? GetMaterial(json.mat ?? json.material!) : undefined;
	const proto = json.proto ? GetProto<RawWeaponData>(json.proto) : undefined;

	const w = new Weapon(
		{
			id: json.id,
			name: json.name, desc: json.desc,
			material: mat,
			proto,
			dmg: json.dmg
		},
	);

	if (json.mods) {
		w.mods = ParseMods(json.mods, w.id);
	}

	w.tohit = json.hit || 0;
	return Item.SetProtoData(json, w);

}

export const ReviveWearable = (json: any) => {

	const proto = GetProto<RawWearableData>(json.proto);
	const mat = GetMaterial(json.mat);

	const w = new Wearable(
		{
			id: json.id,
			name: json.name,
			desc: json.desc,
			material: mat, proto, slot: json.slot, armor: json.armor
		}
	);

	if (json.mods) {
		w.mods = ParseMods(json.mods, w.id);
	}

	Item.SetProtoData(json, w);
	return w;

}

export const GenArmor = (lvl: number = 0, slot?: HumanSlot | null) => {

	lvl = Math.floor(lvl);
	const mat = RandMaterial(lvl);

	let tmp;
	if (slot) {
		tmp = getRandSlot(slot, lvl);
	} else {
		const list = (BaseArmors as RawWearableData[]).filter((t: RawWearableData) => !t.level || t.level <= lvl);
		tmp = list[Math.floor(list.length * Math.random())];
	}

	if (!tmp) return null;

	return Wearable.FromProto(tmp, mat);

}

export function InitArmors() {

	for (let k = BaseArmors.length - 1; k >= 0; k--) {

		const armor = BaseArmors[k] as any as RawWearableData;
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


