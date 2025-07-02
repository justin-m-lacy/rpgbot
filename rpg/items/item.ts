import { randomUUID } from 'crypto';
import { ItemType } from 'rpg/parsers/items';
import { Char } from "../char/char";

export class Item {

	name: string = '';

	desc: string;

	inscrip?: string;

	type: string;

	level: number = 0

	get cost() { return this._cost; }
	set cost(v) { this._cost = v; }

	get attach() { return this._attach; }
	set attach(v) { this._attach = v; }

	toJSON() {

		return {
			id: this.id,
			name: this.name,
			desc: this.desc,
			type: this.type,
			cost: this._cost,
			level: this._level || undefined,
			attach: this.attach ?? undefined,
			maker: this.maker ?? undefined,
			inscrip: this.inscrip || undefined
		}
	}

	readonly id: string;

	private _level: number = 0;

	/**
	 * discord id of crafter.
	 */
	maker?: string;

	/// image attachment
	private _attach?: string;
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
		return [this.getDetails(false), this._attach];
	}

	/**
	 * @returns detailed string description of item.
	*/
	getDetails(imgTag = true) {

		let s = this.name;
		if (this.desc) s += ': ' + this.desc;
		if (this.inscrip) s += ' { ' + this.inscrip + ' }';
		if (this._attach && imgTag) s += ' [img]';
		if (this.maker) s += '\ncreated by ' + this.maker;

		return s;
	}

	toString() { return this.name }

	static ItemMenu(a: Item[], start = 1) {

		const len = a.length;
		if (len === 0) return 'nothing';
		else if (len === 1) return (start) + ') ' + a[0].name + (a[0].attach ? '\t[img]' : '');

		let it = a[0];
		let res = (start++) + ') ' + it.name;
		if (it.attach) res += '\t[img]';

		for (let i = 1; i < len; i++) {

			it = a[i];
			res += '\n' + (start++) + ') ' + it.name;
			if (it.attach) res += '\t[img]';
		}

		return res;

	}

	/**
	 *
	 * @param a
	 */
	static DetailsList(a: Item[]) {

		if (a.length === 0) return 'nothing';
		return a.map(it => it.getDetails()).join(",");

	}

	static Cook(it: Item) {

		const cooking = require('../data/cooking.json');
		const adjs = cooking.adjectives;

		const adj = adjs[Math.floor(adjs.length * Math.random())];

		if ('armor' in it) {
			// @ts-ignore
			it.armor -= 10;
		} else if ('bonus' in it) {
			// @ts-ignore
			it.bonus -= 10;
		}
		it.type = ItemType.Food;

		it.name = adj + ' ' + it.name;

		const desc = cooking.descs[Math.floor(cooking.descs.length * Math.random())];
		it.desc += ' ' + desc;

	}

}

export const Craft = (char: Char, name: string, desc?: string, attach?: string) => {

	const item = new Item(randomUUID({}), { name, desc });

	if (attach) item.attach = attach;

	item.maker = char.name;
	item.created = Date.now();

	const maxBonus = Math.max(char.level.value + char.getModifier('int') + 1, 2);
	item.cost = Math.floor(maxBonus * Math.random());

	char.addHistory('crafts');
	char.addExp(2);
	return char.addItem(item);

}