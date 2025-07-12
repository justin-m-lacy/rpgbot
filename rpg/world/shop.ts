import { Char } from "rpg/char/char";
import { Inventory } from "rpg/inventory";
import { ItemIndex } from "rpg/items/container";
import { Item } from "rpg/items/item";
import { ItemData, ItemType } from "rpg/items/types";
import { GetTradeMod, PayOrFail } from "rpg/trade";
import { Feature } from "rpg/world/feature";
import { Loc } from "rpg/world/loc";

type SaleItem = ItemData & { price: number };

export const IsShop = (t: Item): t is Shop => {
	return t.type === ItemType.Shop;
}

export class Shop<T extends Item = Item> extends Feature {

	inv: Inventory;

	/**
	 * function for restocking inventory.
	 */
	genItem?: (lvl: number) => T | null;

	constructor(name: string,
		opts: {
			level?: number, kind: string,
			desc?: string,
			genItem?: (lvl: number) => T | null
		}
	) {

		super(name, opts.desc ?? `${opts.kind} Shop`, ItemType.Shop);

		this.genItem = opts.genItem;

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
			char.log(`Item ${which} not found in ${this.name}`);
			return false;
		}

		if (item.price) {
			if (!PayOrFail(
				char, this.buyCost(item, GetTradeMod(char))
			)) {
				char.log(`${char.name} cannot afford ${item.name}`);
				return false;
			}
		}
		this.inv.removeId(item.id);

		const ind = char.addItem(item);
		char.log(`${char.name} buys ${item.name} [${ind}]`);

		return true;

	}

	/**
	 * Get sell price of an item based on character
	 * sell modifier.
	 * @param it 
	 * @param mod 
	 */
	private sellCost(it: Item, mod: number) {
		return Math.max(Math.ceil(it.price * (1 + 0.1 * mod)), 0);
	}

	/**
	 * Modified price to buy item.
	 * @param it 
	 * @param mod 
	 * @returns 
	 */
	private buyCost(it: Item, mod: number) {
		return Math.max(Math.ceil(it.price * (10 - 0.05 * mod)), 1);
	}

	sellRange(char: Char, ind: ItemIndex, end: ItemIndex) {

		const items = char.removeRange(ind, end);
		if (!items || !items.length) {
			return char.log(`No items to sell.`);
		}
		this.inv.add(items);

		const mod = GetTradeMod(char);
		let gold = 0;
		for (let i = items.length - 1; i >= 0; i--) {
			gold += this.sellCost(items[i], mod);
		}

		char.addGold(gold);
		char.log(`Sold ${items.length} item for ${gold} gold`);

	}

	sell(char: Char, ind: ItemIndex) {

		const it = char.removeItem(ind);
		if (!it) {
			return char.log(`Item ${ind} not found.`);
		}
		this.inv.add(it);

		const gold = this.sellCost(it, GetTradeMod(char));

		char.addGold(gold);
		char.log(it.name + ' sold for ' + gold + ' gold.');

	}

	onEnter = (shop: Feature, _char: Char, _loc: Loc) => {
		if (Math.random() < 0.1) {
			(shop as Shop<T>).restock();
		}
	}

	/**
	 * restock inventory
	 */
	restock() {

		if (!this.genItem) {
			console.log(`cant restock no gen`);
			return this;
		}

		console.log(`restocking...`);
		while (this.inv.count < 10) {

			const item = this.genItem(this.level);
			if (item) {
				this.inv.add(item);
			} else {
				break;
			}
			if (Math.random() < 0.05) break;
		}

		return this;
	}

	getDetails(char?: Char, imgTag?: boolean): string {

		const mod = char ? GetTradeMod(char) : 1;

		if (this.inv.count === 0) {
			return super.getDetails(char) + '\nThe shop is empty.'
		}
		return this.inv.items.map((v, ind) => {
			return `${ind + 1}) ${v.name}\t\t${this.buyCost(v, mod)}`
		}).join('\n')
	}

}