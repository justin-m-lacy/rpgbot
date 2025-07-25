import { Char } from 'rpg/char/char';
import { ItemMenu } from 'rpg/display/items';
import type { ItemIndex } from 'rpg/items/container';
import { ItemType } from 'rpg/items/types';
import { ReviveItem } from 'rpg/parsers/items';
import { Inventory, SymInventory, type IInventory } from '../inventory';
import { Item } from "./item";

/**
 * Chest extends Item not Inventory to avoid multi-inheritance.
 */
export class Chest extends Item implements IInventory {

	readonly [SymInventory] = true;

	static Decode(json: any) {

		const p = new Chest(
			json.id, Inventory.Revive<Item>(json.inv, ReviveItem)!);
		p.size = json.size;

		return Item.SetProtoData(json, p);

	}

	toJSON() {

		const o = super.toJSON() as any;

		o.size = this.size;
		o.inv = this._inv;

		return o;

	}

	get size() { return this._size; }
	set size(v) { this._size = v; }

	get inv() { return this._inv; }

	get lock() { return this._lock; }
	set lock(v) { this._lock = v; }

	get count() { return this._inv.size; }

	private _size: number = 0;
	private _lock: number = 0;

	private readonly _inv;

	constructor(id: string | undefined, inv: Inventory<Item>) {

		super({ id, name: 'chest', type: ItemType.Chest });

		this._inv = inv;

	}

	takeRange(start: number, end: number) {
		return this._inv.takeRange(start, end);
	}

	getDetails(char?: Char) {
		return ItemMenu(this._inv) + '\n' + super.getDetails(char);
	}

	/**
	 * 
	 * @param wot 
	 */
	get(wot: ItemIndex) { return this._inv.get(wot); }

	/**
	 * 
	 * @param wot 
	 */
	take(wot: ItemIndex) { return this._inv.take(wot); }

	/**
	 * 
	 * @param it 
	 */
	add(it: Item) {

		if (this.count < this.size) {
			this._inv.add(it);
		}
		return null;

	}

}