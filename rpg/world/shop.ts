import { Char } from "rpg/char/char";
import { Inventory } from "rpg/inventory";
import { ItemIndex } from "rpg/items/container";
import { Item } from "rpg/items/item";
import { ItemData } from "rpg/items/types";
import { PayOrFail } from "rpg/trade";
import { Feature } from "rpg/world/feature";

type SaleItem = ItemData & { price: number };

export class Shop<T extends Item> extends Feature {

	inv: Inventory;

	/**
	 * function for restocking inventory.
	 */
	genFunc?: (lvl: number) => T;

	constructor(name: string,
		opts: { level?: number, kind: string, desc?: string, gen?: (lvl: number) => T }
	) {

		super(name, opts.desc ?? `${opts.kind} Shop`);

		this.level = opts.level ?? 0;

		this.inv = new Inventory(undefined);

	}

	/**
	 * buy item from shop.
	 * @param char 
	 * @param which 
	 * @returns index of bought item in char inventory,
	 * or -1 for fail.
	 */
	buy(char: Char, which: ItemIndex) {

		const item = this.inv.get(which);
		if (!item) {
			char.log(`Item not found: ${which}`);
			return -1;
		}

		if (item.price) {
			if (!PayOrFail(char, item.price)) return -1;
		}
		this.inv.removeId(item.id);

		return char.addItem(item);

	}

	sell(char: Char, ind: ItemIndex) {

		const item = char.takeItem(ind);
		if (item) {
			this.inv.add(item);
		}

	}

	/**
	 * restock inventory
	 */
	restock() {
	}

}