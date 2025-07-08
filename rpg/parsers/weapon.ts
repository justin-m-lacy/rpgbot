import { AddProtoItem } from 'rpg/builders/itemgen';
import { Material } from 'rpg/items/material';
import { ItemData } from 'rpg/items/types';
import BaseWeapons from '../data/items/weapons.json';
import { Weapon } from '../items/weapon';

type RawWeaponData = ItemData & (typeof BaseWeapons)[number];

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

export const GenWeapon = (lvl: number) => {

	const mat = Material.Random(lvl);
	if (mat === null) return null;

	//console.log( 'weaps len: ' + baseWeapons.length );
	const tmp = BaseWeapons[Math.floor(BaseWeapons.length * Math.random())];

	if (!tmp) {
		console.warn('weapon template null.');
		return null;
	}

	return Weapon.FromData(tmp, mat);

}

