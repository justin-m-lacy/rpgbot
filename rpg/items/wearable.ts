import { Char } from 'rpg/char/char';
import { RawWearableData } from 'rpg/parsers/armor';
import { ParseMods } from 'rpg/parsers/mods';
import { IMod } from 'rpg/values/imod';
import { Path } from 'rpg/values/paths';
import { Item, } from './item';
import { Material } from './material';

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
	 * @param proto
	 * @param mat
	 */
	static FromProto(proto: RawWearableData, mat?: Material | null, item?: Wearable) {

		const name = mat ? (mat?.name + ' ' + proto.name) : proto.name;

		item ??= new Wearable(undefined, { name }, proto);

		if (mat) {
			item.material = mat?.id;
			item.armor = mat.bonus ? proto.armor + mat.bonus : proto.armor;
		}

		item.slot = proto.slot as HumanSlot;

		if (proto.mods) {
			item.mods = ParseMods(proto.mods, item.id,);
		}

		return Item.InitData(proto, item);

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

	get name() { return this.material ? `${this.material} ${super.name}` : super.name }
	set name(v) { super.name = v; }

	/**
	 * @property slot - equip slot used.
	 */
	slot: HumanSlot = 'hands';
	mods: Path<IMod> | undefined;

	proto?: RawWearableData;

	constructor(id: string | undefined, opts: { name?: string, desc?: string }, proto?: RawWearableData) {

		super(id, opts);
		this._armor = 0;
		this.proto = proto;

	}


	getDetails(char?: Char) {
		return this.name + '\t armor: ' + this.armor + '\t price: ' + this.price + '\n' + super.getDetails(char);
	}


}