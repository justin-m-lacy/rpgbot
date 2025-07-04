import { randomUUID } from 'crypto';
import { ItemData, ItemType } from 'rpg/parsers/items';

export class Item {

	name: string = '';

	desc: string;

	inscrip?: string;

	type: string;

	level: number = 0

	get cost() { return this._cost; }
	set cost(v) { this._cost = v; }

	get embed() { return this._embed; }
	set embed(v) { this._embed = v; }

	toJSON(): Record<string, any> {

		return {
			id: this.id,
			name: this.name,
			desc: this.desc,
			type: this.type,
			cost: this._cost,
			level: this._level || undefined,
			embed: this._embed,
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

		if (json.cost) it.cost = json.cost;
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
	private _embed?: string;
	private _cost: number = 0;

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

	getView(): [string, string | undefined] {
		return [this.getDetails(false), this._embed];
	}

	/**
	 * @returns detailed string description of item.
	*/
	getDetails(imgTag = true) {

		let s = this.name;
		if (this.desc) s += ': ' + this.desc;
		if (this.inscrip) s += ' { ' + this.inscrip + ' }';
		if (this._embed && imgTag) s += ' [img]';
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