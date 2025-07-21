import { Char } from 'rpg/char/char';
import { RawWearableData } from 'rpg/parsers/armor';
import { ParseMods } from 'rpg/parsers/mods';
import { IMod } from 'rpg/values/imod';
import { ApplyMods } from 'rpg/values/modding';
import { Path } from 'rpg/values/paths';
import { Item, } from './item';
import { Material } from './material';

const Slots: Record<string, boolean> = {
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

export type THanded = Wearable & { slot: 'hands' | 'left' | 'right', hands?: number };

export type HumanSlots = {
	[K in HumanSlot]: K extends 'hands' | 'left' | 'right' ? (Wearable | THanded | null) : (Wearable | Wearable[] | null);
}

export const toSlot = (slot?: string | null) => {

	if (slot) {
		const s = slot.toLowerCase();
		if (Slots[s as HumanSlot] === true) {
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
	 * @param material
	 */
	static FromProto(proto: RawWearableData, material?: Material, item?: Wearable) {

		item ??= new Wearable(undefined, { name: proto.name, proto, material: material });

		item.slot = proto.slot as HumanSlot;

		if (proto.mods) {
			item.mods = ParseMods(proto.mods, item.id,);
		}

		return Item.InitData(proto, item) as Wearable;

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

	material?: Material;

	get name() { return this.material ? `${this.material.name} ${super.name}` : super.name }
	set name(v) { super.name = v; }

	/**
	 * @property slot - equip slot used.
	 */
	slot: HumanSlot = 'hands';
	mods: Path<IMod> | undefined;

	proto?: RawWearableData;

	constructor(id: string | undefined,
		opts: { name?: string, desc?: string, proto?: RawWearableData, material?: Material }) {

		super(id, opts);

		this.proto = opts.proto;
		this._armor = opts.proto?.armor || 0;

		this.material = opts.material;
		if (this.material?.alter) {
			ApplyMods(this, this.material.alter);
		}

	}


	getDetails(char?: Char) {
		return this.name + '\t armor: ' + this.armor + '\t price: ' + this.price + '\n' + super.getDetails(char);
	}


}