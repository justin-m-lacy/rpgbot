import { Char } from "rpg/char/char";
import { Item } from "rpg/items/item";
import type { Game } from '../game';

/**
 * Quantity of gold dropped on ground.
 */
export class GoldDrop extends Item {

	private amt: number;

	constructor(amt: number) {

		super({
			name: `${amt} gold coins`,
			desc: `${amt} gold coins`
		});

		this.amt = amt;
	}

	onTake(_: Game, char: Char) {

		char.gold += this.amt;
		return null;

	}

}