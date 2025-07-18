import { Char } from 'rpg/char/char';
import { TNpcAction } from 'rpg/combat/types';
import { ItemData, ItemType } from 'rpg/items/types';
import { ParseMods } from 'rpg/parsers/mods';
import { RawWeaponData } from 'rpg/parsers/weapon';
import { Dice } from 'rpg/values/dice';
import { DamageSrc } from '../formulas';
import { Item } from './item';
import { HumanSlot, Wearable } from './wearable';

export class Weapon extends Wearable implements TNpcAction {

	toJSON() {

		const json = super.toJSON();

		json.dmg = this.dmg;
		json.hit = this.toHit;

		return json;

	}

	static Revive(json: ItemData & {
		slot?: HumanSlot, hit?: number, kind?: string,
		proto?: string,
		material?: string,
		mat?: string,
		mods: any, dmg: any
	}) {

		if (json.proto) {
		}

		const dmg = DamageSrc.Decode(json.dmg);

		const w = new Weapon(json.id, { name: json.name, desc: json.desc }, dmg);

		w.slot = json.slot ?? 'hands';

		if (json.mat) w.material = json.mat;
		//@deprecated
		if (json.material) w.material = json.material;

		if (json.mods) {
			w.mods = json.mods;
		}

		if (json.mods) {
			w.mods = ParseMods(json.mods, w.id);
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

	constructor(id: string | undefined,
		opts: { name?: string, desc?: string }, dmg: DamageSrc, proto?: RawWeaponData) {

		super(id, opts, proto);
		this.dmg = dmg;

		this.type = ItemType.Weapon;
	}

	getDetails(char?: Char) {
		return `${this.name} dmg: ${this.dmg} hitBonus: ${this.toHit} price: ${this.price}\n` + super.getDetails(char);
	}

	/**
	 * roll weapon damage.
	*/
	roll() { return this.dmg.roll(); }


}

export const Fists = new Weapon('fists', { name: 'fists', desc: 'Just plain fists.' },
	new DamageSrc(new Dice(1, 2, 0), 'blunt'));
