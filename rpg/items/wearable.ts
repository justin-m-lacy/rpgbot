import { Char } from 'rpg/char/char';
import { RawArmorData } from 'rpg/parsers/armor';
import { ParseMods } from 'rpg/parsers/mods';
import { IMod } from 'rpg/values/imod';
import { Path } from 'rpg/values/paths';
import { Item, } from './item';
import { Material } from './material';
import { ItemData } from './types';

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
	 * From template data.
	 * @param base
	 * @param mat
	 */
	static FromTemplate(base: RawArmorData, mat?: Material | null) {

		const name = mat ? (mat?.name + ' ' + base.name) : base.name;
		const it = new Wearable(undefined, { name });

		if (mat) {
			it.material = mat?.id;
			it.price = base.price * (mat.priceMod || 1);
			it.armor = mat.bonus ? base.armor + mat.bonus : base.armor;
		}

		it.slot = base.slot as HumanSlot;

		if (base.mods) {
			it.mods = ParseMods(base.mods, it.id,);
		}

		return it;
	}

	toJSON() {

		const json = super.toJSON();

		json.proto = this.proto?.id;

		json.armor = this._armor;
		json.slot = this.slot;
		json.mat = this.material;
		if (this.mods) json.mods = this.mods;

		return json;

	}

	private _armor: number;

	material?: string;

	/**
	 * @property slot - equip slot used.
	 */
	slot: HumanSlot = 'hands';
	mods: Path<IMod> | undefined;

	proto?: ItemData;

	constructor(id: string | undefined, opts: { name?: string, desc?: string }, proto?: ItemData) {

		super(id, opts);
		this._armor = 0;
		this.proto = proto;

	}

	getDetails(char?: Char) {
		return this.name + '\t armor: ' + this.armor + '\t price: ' + this.price + '\n' + super.getDetails(char);
	}


}