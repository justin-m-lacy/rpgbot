import { Char } from 'rpg/char/char';
import { ItemInfo, ItemType } from 'rpg/items/types';
import { RawWearableData } from 'rpg/parsers/armor';
import { ParseMods } from 'rpg/parsers/mods';
import { IMod } from 'rpg/values/imod';
import { ApplyMods } from 'rpg/values/modding';
import { BaseMod } from 'rpg/values/mods/base-mod';
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

export class Wearable<T extends RawWearableData = RawWearableData> extends Item {

	/**
	 * @property armor - armor added. replace with defense?
	 */
	get armor() { return this._armor.value; }
	set armor(v) { this._armor.value = v < 0 ? 0 : v }

	/**
	 * From template data.
	 * @param proto
	 * @param material
	 */
	static FromProto(proto: RawWearableData, material?: Material, item?: Wearable) {

		item ??= new Wearable({ name: proto.name, proto, material: material });

		if (proto.mods) {
			item.mods = ParseMods(proto.mods, item.id,);
		}

		return Item.SetProtoData(proto, item) as Wearable;

	}

	toJSON() {

		const json = super.toJSON();

		json.proto = this.proto?.id;
		json.mat = this.material?.id;

		json.armor = this._armor;
		if (this.slot && this.slot != this.proto?.slot) {
			json.slot = this.slot;
		}

		//if (this.mods) json.mods = this.mods;

		return json;

	}

	protected _armor: BaseMod;

	material?: Material;

	get name() { return this.material ? `${this.material.name} ${super.name}` : super.name }
	set name(v) { super.name = v; }

	/**
	 * @property slot - equip slot used.
	 */
	slot: HumanSlot;
	mods: Path<IMod>;

	proto?: T;

	/**
	 * 
	 * @param id 
	 * @param opts 
	 * @param skipInit - skip apply alter step. prevent double apply alters from superclass.
	 */
	constructor(
		opts: { proto?: T, material?: Material, slot?: HumanSlot, armor?: number, price?: number } & ItemInfo,
		skipInit: boolean = false) {

		super(opts);

		this.type = ItemType.Armor;

		this.proto = opts.proto;
		this.material = opts.material;

		this.name = opts.name ?? opts.proto?.name ?? this.id;
		this.slot = opts.slot ?? opts.proto?.slot as HumanSlot ?? 'hands';

		this.price = opts?.price ?? opts.proto?.price ?? 1;
		this._armor = new BaseMod('armor', opts?.armor || opts.proto?.armor || 0);

		this.mods = ParseMods(opts.proto?.mods ?? {}, this.id, 1);
		this.mods.armor = this._armor;


		if (!skipInit && this.material?.alter) {
			ApplyMods(this, this.material.alter);
		}

	}


	getDetails(char?: Char) {
		return this.name + '\t armor: ' + this.armor.valueOf() + '\t price: ' + this.price + '\n' + super.getDetails(char);
	}


}