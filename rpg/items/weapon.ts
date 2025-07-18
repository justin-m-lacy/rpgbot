import { GetProto } from 'rpg/builders/itemgen';
import { Char } from 'rpg/char/char';
import { TNpcAction } from 'rpg/combat/types';
import { GetMaterial, Material } from 'rpg/items/material';
import { ItemData, ItemType } from 'rpg/items/types';
import { RawWearableData } from 'rpg/parsers/armor';
import { ParseMods } from 'rpg/parsers/mods';
import { ParseValue } from 'rpg/parsers/values';
import { RawWeaponData } from 'rpg/parsers/weapon';
import { Dice } from 'rpg/values/dice';
import { DamageSrc } from '../formulas';
import { Item } from './item';
import { HumanSlot, Wearable } from './wearable';

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

		const it = new Weapon(undefined, {
			name: base.name,
			proto: base, dmg: new DamageSrc(
				ParseValue('dmg', base.dmg), base.kind
			)
		});

		it.tohit = base.hit || 0;
		super.FromProto(base, mat, it);

		it.hands = base.hands ?? 1;
		it.dmg.bonus += mat?.dmg || mat?.bonus || 0;

		return it;

	}

	static Revive(json: ItemData & {
		slot?: HumanSlot, hit?: number, kind?: string,
		proto?: string,
		material?: string,
		mat?: string,
		mods: any, dmg: any
	}) {

		const mat = json.mat ?? json.material ? GetMaterial(json.mat ?? json.material!) : undefined;

		if (json.proto) {

			return Weapon.FromProto(GetProto<RawWeaponData>(json.proto)!, mat);


		} else {
			const w = new Weapon(json.id,
				{
					name: json.name, desc: json.desc,
					material: mat,
					dmg: DamageSrc.Decode(json.dmg)
				},
			);
			w.slot = json.slot ?? 'hands';

			if (json.mods) {
				w.mods = ParseMods(json.mods, w.id);
			}

			if (json.kind) w.kind = json.kind;

			w.tohit = json.hit || 0;
			return Item.InitData(json, w);

		}

	}

	tohit: number = 0;
	hands: number = 1;
	dmg: DamageSrc;

	get kind() { return this.dmg.type };
	set kind(s: string) { this.dmg.type = s; }

	constructor(id: string | undefined,
		opts: { name?: string, desc?: string, dmg: DamageSrc, proto?: RawWearableData, material?: Material }) {

		super(id, opts,);
		this.dmg = opts.dmg;
		this.proto = opts.proto

		this.type = ItemType.Weapon;
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
