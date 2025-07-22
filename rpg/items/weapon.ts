import { Char } from 'rpg/char/char';
import { TNpcAction } from 'rpg/combat/types';
import { Material } from 'rpg/items/material';
import { ItemType } from 'rpg/items/types';
import { RawWearableData } from 'rpg/parsers/armor';
import { ParseValue } from 'rpg/parsers/values';
import { RawWeaponData } from 'rpg/parsers/weapon';
import { Dice } from 'rpg/values/dice';
import { ApplyMods } from 'rpg/values/modding.js';
import { DamageSrc } from '../damage.js';
import { Wearable } from './wearable';

export class Weapon extends Wearable implements TNpcAction {

	toJSON() {

		const json = super.toJSON();

		if (this.proto) {

			json.name = undefined;
			json.desc = undefined;
			if (this.slot != this.proto.slot) {
				this.slot = this.slot;
			}
			json.price = undefined;

		} else {
			json.name = this._name;
			json.dmg = this.dmg;
			json.hit = this.tohit;
		}

		return json;

	}

	/**
	 * From template data.
	 * @param base
	 * @param mat
	 */
	static FromProto(base: RawWeaponData, mat?: Material) {

		const w = new Weapon(undefined, {
			name: base.name,
			proto: base, dmg: new DamageSrc(
				ParseValue('dmg', base.dmg), base.kind
			),
			material: mat
		});

		w.tohit = base.hit || 0;
		super.FromProto(base, mat, w);

		w.hands = base.hands ?? 1;
		w.dmg.base += mat?.dmg || mat?.bonus || 0;

		return w;

	}

	tohit: number = 0;
	hands: number = 1;
	dmg: DamageSrc;

	get kind() { return this.dmg.type };
	set kind(s: string) { this.dmg.type = s; }

	constructor(id: string | undefined,
		opts: { name?: string, desc?: string, dmg: DamageSrc, proto?: RawWearableData, material?: Material }) {

		super(id, opts, true);
		this.dmg = opts.dmg;

		this.type = ItemType.Weapon;

		if (this.material?.alter) {
			ApplyMods(this, this.material.alter);
		}
	}

	getDetails(char?: Char) {
		return `${this.name} dmg: ${this.dmg} hitBonus: ${this.tohit} price: ${this.price}\n` + super.getDetails(char);
	}


}

export const Fists = new Weapon('fists',
	{
		name: 'fists', desc: 'Just plain fists.',
		dmg: new DamageSrc(new Dice(1, 2, 0), 'blunt')
	},
);
