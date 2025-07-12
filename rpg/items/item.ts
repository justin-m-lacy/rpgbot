import { randomUUID } from 'crypto';
import { Char } from 'rpg/char/char';
import { ItemData, ItemType } from 'rpg/items/types';

export type TStacker = Item & {
	stack: true,
	count: number
}

export const IsStack = (it: Item): it is TStacker => {
	return it.stack && typeof (it as any).count === 'number';
}

export class Item {

	name: string = '';

	desc: string;

	inscrip?: string;

	type: string;

	level: number = 0

	/// price in gold.
	get price() { return this._price; }
	set price(v) { this._price = v; }

	get stack() { return false }

	toJSON(): Record<string, any> {

		return {
			id: this.id,
			name: this.name,
			desc: this.desc,
			type: this.type,
			price: this._price,
			level: this._level || undefined,
			embed: this.embed,
			maker: this.maker,
			inscrip: this.inscrip
		}
	}

	/**
	 * Since Item is subclassed, the sub item created
	 * is passed as a param.
	 * @param json
	 * @param it
	 */
	static InitData<D extends ItemData = ItemData>(json: D, it?: Item) {

		it ??= new Item(json.id);
		it.name = json.name;

		if (json.desc) it.desc = json.desc;
		if (json.price) it.price = json.price;
		if (json.embed) it.embed = json.embed;
		if (json.maker) it.maker = json.maker;
		if (json.inscrip) it.inscrip = json.inscrip;

		if (json.level && !Number.isNaN(json.level)) {
			it.level = json.level;
		}

		return it;

	}

	readonly id: string;

	private _level: number = 0;

	// discord id of crafter.
	maker?: string;

	/// image attachment
	embed?: string;
	private _price: number = 0;

	/**
	 * @property creation timestamp.
	 */
	created: number = 0;

	constructor(id: string | null | undefined,
		info?: {
			type?: ItemType,
			desc?: string,
			name?: string
		}) {

		this.id = id ?? randomUUID();
		this.name = info?.name ?? this.id;
		this.type = info?.type ?? ItemType.Unknown;
		this.desc = info?.desc ?? '';

	}

	/**
	 * Option to remap Item on player take.
	 */
	onTake(char: Char): Item | null | undefined { return this }

	getView(char?: Char): [string, string | undefined] {
		return [this.getDetails(char, false), this.embed];
	}

	/**
	 * @returns detailed string description of item.
	*/
	getDetails(viewer?: Char, imgTag = true) {

		let s = this.name;
		if (this.desc) s += ': ' + this.desc;
		if (this.inscrip) s += ' { ' + this.inscrip + ' }';
		if (this.embed && imgTag) s += ' [img]';
		if (this.maker) s += '\ncreated by ' + this.maker;

		return s;
	}

	toString() { return this.name }

	/**
	 * @param a
	 */
	static DetailsList(a: Item[]) {

		if (a.length === 0) return 'nothing';
		return a.map(it => it.getDetails()).join(",");

	}

}