import { randomUUID } from 'crypto';
import type { Char } from 'rpg/char/char';
import type { Game } from 'rpg/game';
import { type ItemProto, ItemType } from 'rpg/items/types';

export type TStacker = Item & {
	stack: boolean,
	count: number
}

export const IsStack = (it: Item): it is TStacker => {
	return it.stack && typeof (it as any).count === 'number';
}

export class Item<Proto extends ItemProto = ItemProto> {

	/**
	 * accessors for subclass override
	 */
	get name() { return this._name }
	set name(v) { this._name = v }

	_name: string = '';

	// accessor for subclass override
	get desc() { return this._desc }
	set desc(v) { this._desc = v; }
	private _desc: string = '';

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
			proto: this.proto?.id,
			name: this._name,
			desc: this.desc,
			type: this.type,
			price: this._price != 0 ? this._price : undefined,
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
	static SetProtoData<D extends ItemProto = ItemProto>(json?: D, it?: Item) {

		it ??= new Item(json ?? { id: 'ads' });

		if (json) {
			if (json.price) it.price = json.price;
			if (json.embed) it.embed = json.embed;
			if (json.maker) it.maker = json.maker;
			if (json.inscrip) it.inscrip = json.inscrip;

			if (json.level) {
				if (typeof json.level === 'string') {
					json.level = Number.parseInt(json.level);
				}
				it.level = typeof json.level === 'number' && Number.isNaN(json.level) ? json.level : 1;
			}
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

	proto?: Proto;

	constructor(info?: Omit<Proto, 'id'> & { id?: string }, proto?: Proto) {

		this.id = info?.id ?? randomUUID();

		this.proto = proto;

		this.name = info?.name ?? proto?.name ?? this.id;
		this.type = info?.type ?? proto?.type ?? ItemType.Item;
		this.desc = info?.desc ?? proto?.desc ?? '';

	}

	use(game: Game, char: Char): Promise<void> | void {
		char.log(`${char.name} tries to use ${this.name}. Nothing happens.`);
	}

	/**
	 * On pickup item from ground.
	 * @returns optional remap Item on player take.
	 */
	onTake(game: Game, char: Char): Item | null { return this }

	/**
	 * On Item dropped.
	 * @param game 
	 * @param char
	 * @returns false to cancel drop. true to allow.
	 */
	onDrop(game: Game, char: Char) {

		if (this.proto?.ondrop) {

			if (this.proto.ondrop.spawn) {
				game.spawn(this.proto.ondrop.spawn, char.at);
			}
			return !this.proto.ondrop.destroy;

		}
		return true;

	}


	getView(char?: Char): [string, string | undefined] {
		return [this.getDetails(char, false), this.embed];
	}

	/**
	 * @returns detailed string description of item.
	*/
	getDetails(viewer?: Char, imgTag = true) {

		let s = this.name;
		if (IsStack(this)) s += ` (x${this.count})`
		if (this.desc) s += ': ' + this.desc;
		if (this.inscrip) s += ' { ' + this.inscrip + ' }';
		if (this.embed && imgTag) s += ' [img]';
		if (this.maker) s += '\ncreated by ' + this.maker;

		return s;
	}

	toString() { return this.name + (IsStack(this) && this.count > 1 ? ` (${this.count})` : '') }

	/**
	 * @param a
	 */
	static DetailsList(a: Item[]) {

		if (a.length === 0) return 'nothing';
		return a.map(it => it.getDetails()).join(",");

	}

}