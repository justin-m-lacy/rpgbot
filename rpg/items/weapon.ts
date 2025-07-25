import { Char } from 'rpg/char/char';
import { TNpcAction } from 'rpg/combat/types';
import { Material } from 'rpg/items/material';
import { ItemType } from 'rpg/items/types';
import { RawWeaponData } from 'rpg/parsers/weapon';
import { Dice } from 'rpg/values/dice';
import { ApplyMods } from 'rpg/values/modding.js';
import { TValue } from 'rpg/values/types.js';
import { DamageSrc } from '../damage.js';
import { Wearable } from './wearable';

export class Weapon extends Wearable<RawWeaponData> implements TNpcAction {

	toJSON() {

		const json = super.toJSON();

		if (this.proto) {

			json.name = undefined;
			json.desc = undefined;
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
	 * @param proto
	 * @param mat
	 */
	static FromProto(proto: RawWeaponData, mat?: Material) {

		const w = new Weapon({
			name: proto.name,
			proto: proto,
			material: mat
		});

		w.tohit = proto.hit || 0;
		super.FromProto(proto, mat, w);

		return w;

	}

	tohit: number = 0;
	hands: number = 1;
	dmg: DamageSrc;

	get kind() { return this.dmg.type };
	set kind(s: string) { this.dmg.type = s; }

	constructor(
		opts: {
			id?: string | undefined,
			name?: string,
			dmg?: number | string | TValue,
			kind?: string,
			desc?: string,
			proto?: RawWeaponData,
			material?: Material
		}) {

		super(opts, true);

		this.type = ItemType.Weapon;

		this.dmg = DamageSrc.From(opts.dmg ?? opts.proto?.dmg, opts.kind ?? opts.proto?.kind);

		if (this.material?.alter) {
			ApplyMods(this, this.material.alter);
		}
		this.hands = this.proto?.hands ?? 1;

	}

	getDetails(char?: Char) {
		return `${this.name} dmg: ${this.dmg} hitBonus: ${this.tohit} price: ${this.price}\n` + super.getDetails(char);
	}


}

export const Fists = new Weapon(
	{
		id: 'fists',
		name: 'fists', desc: 'Just plain fists.',
		dmg: new Dice(1, 2, 0),
		kind: 'blunt'
	},
);
