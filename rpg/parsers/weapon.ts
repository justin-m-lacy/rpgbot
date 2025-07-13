import BaseWeapons from 'data/items/weapons.json';
import { AddProtoItem } from 'rpg/builders/itemgen';
import { DamageSrc } from 'rpg/formulas';
import { Material, RandMaterial } from 'rpg/items/material';
import { ItemData } from 'rpg/items/types';
import { ParseMods } from 'rpg/parsers/mods';
import { ParseValue } from 'rpg/parsers/values';
import { Weapon } from '../items/weapon';

type RawWeaponData = { hit?: number, mods?: Record<string, any> } & ItemData
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

	lvl = Math.floor(lvl);
	const mat = RandMaterial(lvl ?? 0);
	if (mat === null) return null;

	return BuildWeapon(
		BaseWeapons[Math.floor(BaseWeapons.length * Math.random())] as RawWeaponData,
		mat);

}
/**
 * Create a new weapon from a base weapon object
 * and a weapon material.
 * @param tmp 
 * @param mat 
 */
const BuildWeapon = (tmp: RawWeaponData, mat?: Material) => {

	const w = new Weapon(undefined, tmp.name, new DamageSrc(
		ParseValue('dmg', tmp.dmg), tmp.type
	));

	if (tmp.hands) w.hands = tmp.hands;
	if (tmp.mods) w.mods = ParseMods(tmp.mods, w.id);

	w.toHit = tmp.hit || 0;

	/// todo: apply as a mod.
	if (mat) {

		w.name = mat.name + ' ' + w.name;
		w.material = mat.name;
		w.price = tmp.price * (mat.priceMod || 1);

		w.dmg.bonus += mat.dmg || mat.bonus || 0;
	}

	return w;

}