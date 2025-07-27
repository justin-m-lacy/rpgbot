import BaseWeapons from 'data/items/weapons.json';
import { AddProtoItem } from 'rpg/builders/itemgen';
import { RandMaterial } from 'rpg/items/material';
import { ItemData } from 'rpg/items/types';
import { Weapon } from 'rpg/items/weapon';
import { RawWearableData } from 'rpg/parsers/armor';

export type RawWeaponData = RawWearableData & { hit?: number, mods?: Record<string, any> } & ItemData
	& (typeof BaseWeapons)[number];

export const InitWeapons = () => {

	for (const k in BaseWeapons) {
		const w = BaseWeapons[k] as RawWeaponData;
		if (!w.id) {
			w.id = w.name
		} else if (!w.name) {
			w.name = w.id;
		}
		AddProtoItem(w);
	}
}

export const GenWeapon = (lvl: number = 0) => {

	return Weapon.FromProto(
		BaseWeapons[Math.floor(BaseWeapons.length * Math.random())] as RawWeaponData,
		RandMaterial(Math.floor(lvl)));

}