import { Char } from "rpg/char/char";
import { Inventory } from "rpg/inventory";
import { ItemIndex } from "rpg/items/container";
import { Item } from "rpg/items/item";
import { ItemData } from "rpg/items/types";
import { Feature } from "rpg/world/feature";

type SaleItem = ItemData & { price: number };

export class Shop<T extends Item> extends Feature {

	inv: Inventory<T>;

	constructor(name: string, desc: string) {

		super(name, desc);

		this.inv = new Inventory(undefined);

	}

	/**
	 * buy item from shop.
	 * @param char 
	 * @param which 
	 */
	buy(char: Char, which: ItemIndex) {

	}

	/**
	 * restock inventory
	 */
	restock() {
	}

}