import { Char } from "rpg/char/char";
import { Item } from "rpg/items/item";

/**
 * Quantity of gold dropped on ground.
 */
export class GoldDrop extends Item {

	private amt: number;

	constructor(amt: number) {

		super(undefined, {
			name: `${amt} gold coins`,
			desc: `${amt} gold coins`
		});

		this.amt = amt;
	}

	onTake(char: Char) {

		char.gold += this.amt;

	}

}