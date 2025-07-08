import { TCombatAction } from 'rpg/combat/types';
import { ItemData, ItemType } from 'rpg/items/types';
import { ParseValue } from 'rpg/parsers/values';
import { Dice } from 'rpg/values/dice';
import { DamageSrc } from '../formulas';
import { Item } from './item';
import { Wearable } from './wearable';

export class Weapon extends Wearable implements TCombatAction {

	toJSON() {

		const json = super.toJSON();

		json.dmg = this.dmg;
		json.hit = this.toHit;

		return json;

	}

	static Decode(json: ItemData & { hit?: number, kind?: string, material: string, mods: any, dmg: any }) {

		const dmg = new DamageSrc(ParseValue('dmg', json.dmg || 0), json.kind || 'blunt');

		const w = new Weapon(json.id, json.name, dmg, json.desc);

		if (json.material) w.material = json.material;
		if (json.mods) {
			w.mods = json.mods;
		}

		if (json.kind) w.kind = json.kind;

		w.toHit = json.hit || 0;

		return Item.InitData(json, w);

	}

	toHit: number = 0;
	hands: number = 1;
	dmg: DamageSrc;

	get kind() { return this.dmg.type };
	set kind(s: string) { this.dmg.type = s; }

	constructor(id: string | undefined, name: string, dmg: DamageSrc, desc?: string) {

		super(id, name, desc);
		this.dmg = dmg;

		this.type = ItemType.Weapon;
	}

	getDetails() {
		return `${this.name} dmg: ${this.dmg} hitBonus: ${this.toHit} price: ${this.price}\n` + super.getDetails();
	}

	/**
	 * roll weapon damage.
	*/
	roll() { return this.dmg.roll(); }


}

const Fists = new Weapon('fists', 'fists',
	new DamageSrc(new Dice(1, 2, 0), 'blunt'),
	'Just plain fists.');
