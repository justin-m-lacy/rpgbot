import { Material } from 'rpg/items/material';
import BaseWeapons from '../data/items/weapons.json';
import { Weapon } from '../items/weapon';

type RawWeaponData = (typeof BaseWeapons)[number];

export const GenWeapon = (lvl: number) => {

	const mat = Material.Random(lvl);
	if (mat === null) return null;

	//console.log( 'weaps len: ' + baseWeapons.length );
	const tmp = BaseWeapons[Math.floor(BaseWeapons.length * Math.random())];

	if (!tmp) {
		console.log('weapon template null.');
		return null;
	}

	return Weapon.FromData(tmp, mat);

}

