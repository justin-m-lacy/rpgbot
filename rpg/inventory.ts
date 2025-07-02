import { IsInt } from 'rpg/util/parse';
import { Viewable } from 'rpg/values/types';
import { type ItemIndex } from './items/container';
import { Item } from './items/item';

export type ItemPicker<T = Item> = ItemIndex | T;

export const SymInventory = Symbol('Inv');

export interface IInventory {
	[SymInventory]: true,
	take(which?: number | string | Item,
		sub?: ItemPicker): Item | Item[] | null,
	takeRange(start: ItemIndex, end: ItemIndex): void;
}

export const IsInventory = (a: any): a is Inventory => {
	return a && typeof a === 'object' && SymInventory in a;
}

export class Inventory<T extends Viewable = Item> extends Item {

	readonly [SymInventory] = true;

	get count() { return this.items.length; }

	readonly items: T[] = [];

	static Revive<D extends Viewable = Item>(
		json: any,
		reviver: (data: any) => D | null | undefined,
		inv?: Inventory<D>) {

		const arr = json.items;
		const len = arr.length;

		if (!inv) inv = new Inventory<D>();
		const items = inv.items;
		items.length = 0;

		for (let i = 0; i < len; i++) {

			const it = reviver(arr[i]);
			if (it) items.push(it);
			else console.warn('Inventory: ERR PARSING: ' + arr[i]);

		}

		return inv;

	}

	constructor(id?: string, info?: { name?: string, desc?: string }) {
		super(id, info);
	}

	toJSON() {
		return { items: this.items, ...super.toJSON() };
	}

	getList() {
		return Item.ItemList(this.items);
	}

	/**
	 * Retrieve item by name or index.
	 * @param  start
	 * @returns  Item found, or null on failure.
	 */
	get(start?: ItemIndex): T | null {

		/// 0 is also not allowed because indices are 1-based.
		if (!start) return null;

		if (typeof start === 'string') {

			if (!IsInt(start)) {
				return this.findItem(start);
			} else {
				start = parseInt(start);
			}

		} else if (Number.isNaN(start)) {
			/// initial index passed was NaN.
			return null;
		}


		start--;
		if (start >= 0 && start < this.items.length) return this.items[start];

		return null;

	}

	/**
	 * Returns an item from a sub-inventory.
	 * If base item is not an Inventory, and second param
	 * is a number, returns a range of items.
	 * @param base
	 * @param sub
	 * @returns
	 */
	getSub(base: string | number, sub?: string | number): T | T[] | null {

		const it = this.get(base) as T;
		if (!it) return null;

		if (!sub) return it;

		if (it instanceof Inventory) return it.get(sub);
		else return this.takeRange(base, sub);

	}

	/**
	 * Takes item from a sub-inventory, or a range of items
	 * if the base item is not an inventory, and the second param
	 * is a number.
	 * @param base
	 * @param  sub
	 * @returns
	 */
	takeSub(base: ItemPicker<T>, sub: ItemPicker<T> | ItemIndex): T | T[] | null {

		const it = this.take(base) as Inventory<T> | null;
		if (!it) return null;

		/// TODO: this is clearly wrong.
		if (IsInventory(it)) return it.take(sub);
		else return this.takeRange(base as ItemIndex, sub as ItemIndex);

	}

	findItem(name: string) {

		const lower = name.toLowerCase();
		for (let i = this.items.length - 1; i >= 0; i--) {

			const it = this.items[i];
			if (!it) continue;
			if (it.id === lower) return this.items[i];
			else if (it.name && it.name.toLowerCase() === lower) return this.items[i];

		}
		return null;
	}

	/**
	 * Attempts to remove an item by name or index.
	 * @param which
	 * @returns item removed, or null if none found.
	 */
	take(which?: number | string | T,
		sub?: ItemPicker<T>): T | T[] | null {

		if (which === null || which === undefined) return null;
		if (sub) return this.takeSub(which, sub);

		if (typeof which === 'object') {

			const ind = this.items.indexOf(which);
			if (ind >= 0) return this.items.splice(ind, 1)[0];
			return null;

		}

		if (typeof which === 'string') {

			if (!IsInt(which)) {

				which = which.toLowerCase();
				for (let i = this.items.length - 1; i >= 0; i--) {

					if (!this.items[i]) continue;
					if (this.items[i].id === which ||
						this.items[i].name.toLowerCase() === which) {
						return this.items.splice(i, 1)[0];
					}

				}
				return null;

			} else {
				which = parseInt(which);
			}

		}

		which--;
		if (which >= 0 && which < this.items.length) return this.items.splice(which, 1)[0];

		return null;

	}

	/**
	 *
	 * @param start - start number of items to take.
	 * @param end number of items to take.
	 * @returns - Range of items found.
	 */
	takeRange(start: ItemIndex, end: ItemIndex): T[] | null {

		if (typeof start === 'string') {
			start = parseInt(start);
		}
		if (typeof end === 'string') {
			end = parseInt(end);
		}
		if (isNaN(start) || isNaN(end)) return null;

		if (--start < 0) start = 0;
		if (end > this.items.length) { end = this.items.length; }

		return this.items.splice(start, end - start);

	}



}