import { randomUUID } from 'crypto';
import { TCombatAction } from 'rpg/combat/types';
import { ItemType } from 'rpg/items/types';
import { Dice } from 'rpg/values/dice';
import * as forms from '../formulas';
import { DamageSrc } from '../formulas';
import { Item } from './item';
import { Material } from './material';
import { Wearable } from './wearable';

export class Weapon extends Wearable implements TCombatAction {

	toJSON() {

		const json = super.toJSON();
		json.dmg = this.damage;
		json.hit = this.toHit;

		if (this.mods) json.mods = this.mods;

		return json;

	}

	static Decode(json: any) {

		const w = new Weapon(json.id, json.name, json.desc);

		if (json.material) w.material = json.material;

		if (json.mods) w.mods = json.mods;

		if (json.dmg) {
			w.damage = DamageSrc.Decode(json.dmg);
		} else {
			console.log('Error weap dmg. no dmg found.')
			w.damage = new DamageSrc(null, json.dmgType);
		}

		if (json.dmgType) w.dmgType = json.dmgType;

		w.toHit = json.hit || 0;

		return Item.InitData(json, w);

	}

	/**
	 * Create a new weapon from a base weapon object.
	 * @param tmp 
	 * @param mat 
	 */
	static FromData(tmp: any, mat?: Material) {

		const damage = DamageSrc.FromString(tmp.dmg, tmp.type);

		const w = new Weapon(randomUUID(), tmp.name, damage);

		if (tmp.hands) w.hands = tmp.hands;
		if (tmp.mods) w.mods = Object.assign({}, tmp.mods);

		w.toHit = tmp.hit || 0;

		if (mat) {

			w.name = mat.name + ' ' + w.name;
			w.material = mat.name;
			w.price = mat.priceMod ? tmp.cost * mat.priceMod : tmp.cost;

			w.damage.bonus += mat.dmg || mat.bonus || 0;
		}

		return w;

	}

	get toHit() { return this._toHit; }
	set toHit(v) { this._toHit = v; }

	get dmgType() { return this.damage.type; }
	set dmgType(s: string) { this.damage.type = s; }

	private _toHit: number = 0;
	hands: number = 1;
	damage: DamageSrc;

	constructor(id: string, name: string, dmg: DamageSrc, desc?: string) {

		super(id, name, desc);
		this.damage = dmg;

		this.type = ItemType.Weapon;
	}

	getDetails() {
		return `${this.name} dmg: ${this.damage} hitBonus: ${this.toHit} price: ${this.price}\n` + super.getDetails();
	}

	/**
	 * roll weapon damage.
	*/
	roll() { return this.damage.roll(); }


}

const Fists = new Weapon('fists', 'fists',
	new forms.DamageSrc(new Dice(1, 2, 0), 'blunt'),
	'Just plain fists.');
