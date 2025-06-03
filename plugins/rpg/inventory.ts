import { Container } from './items/container';
import { Item } from './items/item';
import * as ItemGen from './items/itemgen';

export type ItemPicker = string | number | Item;
export type ItemIndex = string | number;

export class Inventory extends Container<Item> {

	static FromJSON(json: any, inv?: Inventory) {

		const arr = json.items;
		const len = arr.length;

		if (!inv) inv = new Inventory();
		const items = inv.items;

		for (let i = 0; i < len; i++) {

			const it = ItemGen.fromJSON(arr[i]);
			if (it) items.push(it);
			else console.log('Inventory: ERR PARSING: ' + arr[i]);

		}

		return inv;

	}

	constructor() {
		super();
	}

	toJSON() { return { items: this._items }; }

	getList() {
		return Item.ItemList(this._items);
	}

	/**
	 * Retrieve item by name or index.
	 * @param  start
	 * @returns  Item found, or null on failure.
	 */
	get(start?: ItemIndex,): Item | null {

		/// 0 is also not allowed because indices are 1-based.
		if (!start) return null;

		if (typeof start === 'string') {
			const num = parseInt(start);
			if (Number.isNaN(num)) {
				return this.findItem(start);
			} else {
				start = num;
			}
		} else if (Number.isNaN(start)) {
			/// initial index passed was NaN.
			return null;
		}


		start--;
		if (start >= 0 && start < this._items.length) return this._items[start];


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
	getSub(base: string | number, sub?: string | number): Item | Item[] | null {

		const it = this.get(base) as Item;
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
	takeSub(base: ItemPicker, sub: ItemPicker | ItemIndex): Item | Item[] | null {

		const it = this.take(base) as Inventory | null;
		if (!it) return null;

		/// TODO: this is clearly wrong.
		if (it.type === 'chest') return it.take(sub);
		else return this.takeRange(base as ItemIndex, sub as ItemIndex);

	}

	/**
	 * Attempts to remove an item by name or index.
	 * @param which
	 * @returns item removed, or null if none found.
	 */
	take(which?: number | string | Item,
		sub?: ItemPicker): Item | Item[] | null {

		if (which === null || which === undefined) return null;
		if (sub) return this.takeSub(which, sub);

		if (which instanceof Item) {

			const ind = this._items.indexOf(which);
			if (ind >= 0) return this._items.splice(ind, 1)[0];
			return null;

		}

		if (typeof which === 'string') {

			if (Number.isNaN(which)) {

				which = which.toLowerCase();
				for (let i = this._items.length - 1; i >= 0; i--) {

					if (this._items[i]?.name.toLowerCase() === which) return this._items.splice(i, 1)[0];

				}
				return null;

			} else {
				which = parseInt(which);
			}

		}

		which--;
		if (which >= 0 && which < this._items.length) return this._items.splice(which, 1)[0];

		return null;

	}

}