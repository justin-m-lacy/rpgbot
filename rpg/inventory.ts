import { IsInt } from 'rpg/util/parse';
import { SymEncode } from 'rpg/values/types';
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

export class Inventory<T extends Item = Item> extends Item implements IInventory {

	readonly [SymInventory] = true;

	get count() { return this.items.length; }

	readonly items: T[] = [];

	/**
	 * 
	 * @param encoder - data encoder.
	 */
	[SymEncode](encoder?: (it: T) => any) {

		const data = super.toJSON();
		if (this.items.length > 0) {
			data.items = encoder ? this.items.map(encoder) : this.items;
		}

		return data;

	}

	toJSON(): Record<string, any> & { items?: any[] } {
		const data = super.toJSON();
		if (this.items.length > 0) {
			data.items = this.items;
		}

		return data;
	}

	static Decode<I extends Item = Item>(
		json: any,
		reviver: (data: any) => I | null | undefined,
		inv?: Inventory<I>) {

		const arr = json.items;
		const len = arr.length;

		if (!inv) inv = new Inventory<I>();
		const items = inv.items;
		items.length = 0;

		for (let i = 0; i < len; i++) {

			const it = reviver(arr[i]);
			if (it) items.push(it);
			else console.warn('Inventory PARSING: ' + arr[i]);

		}

		return inv;

	}

	constructor(id?: string, info?: { name?: string, desc?: string }) {
		super(id, info);
	}

	/**
	 *
	 * @param it
	 * @returns starting 1-index where items were added.
	 */
	add(it?: T | T[] | (T | null | undefined)[] | null) {

		if (Array.isArray(it)) {
			const ind = this.items.length + 1;

			it = it.filter((v): v is T => v != null);
			this.items.push(...it as T[]);

			return ind;
		}

		if (it != null) {
			this.items.push(it);
			return this.items.length;
		}
		return -1;

	}

	/**
	 * Return item without removing it.
	 * @param  start
	 * @returns  Item found, or null on failure.
	 */
	get(start?: ItemIndex): T | null {

		/// 0 is also not allowed because indices are 1-based.
		if (!start) return null;

		if (typeof start === 'string') {

			if (!IsInt(start)) {
				return this.find(start);
			} else {
				start = Number.parseInt(start);
			}

		} else if (Number.isNaN(start)) {
			/// initial index passed was NaN.
			return null;
		}


		start--;
		return this.items[start];

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

	/**
	 * Check if inventory has item with id or name.
	 * @param id 
	 */
	has(id: string) {
		const lower = id.toLowerCase();
		for (let i = this.items.length - 1; i >= 0; i--) {

			const it = this.items[i];
			if (!it) continue;
			if (it.id === lower) return true;
			else if (it.name && it.name.toLowerCase() === lower) return true;

		}
		return false;
	}

	find(id: string) {

		const lower = id.toLowerCase();

		for (let i = this.items.length - 1; i >= 0; i--) {

			const it = this.items[i];
			if (!it) continue;
			if (it.id === lower) return this.items[i];
			else if (it.name?.toLowerCase() === lower) return this.items[i];

		}
		return null;
	}

	/**
	 * Attempt to remove an item by name or index.
	 * @param which
	 * @returns item removed, or null if none found.
	 */
	take(which?: number | string | T): T | null {

		if (which === null || which === undefined) return null;

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

	removeId(id: string) {
		for (let i = this.items.length - 1; i >= 0; i--) {
			if (this.items[i].id == id) return this.items.splice(i, 1)[0];
		}
		return undefined;
	}

	/**
	 * Remove all items matching predicate; returns the list of items removed.
	 * @param p
	 */
	removeWhere(p: (it: T) => boolean) {

		const r = [];

		for (let i = this.items.length - 1; i >= 0; i--) {
			if (p(this.items[i])) r.push(this.items.splice(i, 1)[0]);
		}

		return r;

	}

	/**
	 * Removes and returns random item from inventory.
	 * @returns random item from Inventory, or null.
	 */
	randItem() {

		const len = this.items.length;
		if (len === 0) return null;
		return this.items.splice(Math.floor(len * Math.random()), 1)[0];

	}


}