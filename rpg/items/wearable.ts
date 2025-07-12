import { Char } from 'rpg/char/char';
import { ParseMods } from 'rpg/parsers/mods';
import { IMod } from 'rpg/values/imod';
import { Path } from 'rpg/values/paths';
import { Item, } from './item';
import { Material } from './material';
import { ItemType } from './types';

const Slots: { [s: string]: boolean } = {
	'head': true,
	'hands': true,
	'back': true,
	'waist': true,
	'neck': true,
	'fingers': true,
	'chest': true,
	'legs': true,
	'shins': true,
	'feet': true,
	'left': true,
	'right': true,
}

export const GetSlots = () => Object.keys(Slots);

export type HumanSlot = 'head' | 'hands' | 'back' | 'waist' | 'neck'
	| 'fingers' | 'chest' | 'legs' | 'shins' | 'feet' | 'left' | 'right';


export const toSlot = (slot?: string | null) => {

	if (slot) {
		const s = slot.toLowerCase();
		if (Slots[s] === true) {
			return s as HumanSlot;
		}
	}
	return null;
}

export class Wearable extends Item {

	/**
	 * @property armor - armor added. replace with defense?
	 */
	get armor() { return this._armor; }
	set armor(v) { this._armor = v < 0 ? 0 : v }

	/**
	 * @property material - armor material.
	 */
	get material() { return this._material; }
	set material(m) { this._material = m; }

	/**
	 * From template data.
	 * @param base
	 * @param mat
	 */
	static FromData(base: any, mat?: Material | null) {

		const name = mat ? (mat?.name + ' ' + base.name) : base.name;
		const it = new Wearable(undefined, name);

		if (mat) {
			it.material = mat?.id;
			it.price = base.price * (mat.priceMod || 1);
			it.armor = mat.bonus ? base.armor + mat.bonus : base.armor;
		}

		it.slot = base.slot;

		if (base.mods) {
			it.mods = ParseMods(base.mods, it.id,);
		}

		return it;
	}

	toJSON() {

		const json = super.toJSON() as any;

		json.armor = this._armor;
		json.slot = this.slot;
		json.material = this._material;
		if (this.mods) json.mods = this.mods;

		return json;

	}

	private _armor: number;
	private _material?: string;

	/**
	 * @property slot - equip slot used.
	 */
	slot: HumanSlot = 'hands';
	mods: Path<IMod> | undefined;

	constructor(id: string | undefined, name: string, desc?: string) {

		super(id, { name, desc, type: ItemType.Armor });
		this._armor = 0;

	}

	getDetails(char?: Char) {
		return this.name + '\t armor: ' + this.armor + '\t price: ' + this.price + '\n' + super.getDetails(char);
	}


}