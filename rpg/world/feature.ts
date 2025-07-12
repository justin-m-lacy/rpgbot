import { type Game } from 'rpg/game';
import { ItemType } from 'rpg/items/types';
import { Action } from 'rpg/magic/action';
import { type Loc } from 'rpg/world/loc';
import { Char } from '../char/char';
import { Item } from '../items/item';

export class Feature extends Item {

	/**
	 * feedback when using item.
	 */
	fb?: string;

	toJSON() {

		const ob = super.toJSON() as any;

		if (this.action) ob.action = this.action.name;
		if (this.fb) ob.fb = this.fb;

		return ob;

	}

	action?: Action;

	constructor(name: string, desc: string, type: ItemType = ItemType.Feature) {
		super(undefined, { name: name, desc: desc, type });
	}

	/**
	 * override func for char enter location.
	 * @param char
	 * @param loc 
	 */
	onEnter?: (f: typeof this, char: Char, loc: Loc) => void;

	use(game: Game, char: Char) {

		if (this.fb) {
			char.log(this.fb.replace('%c', char.name) + ' ');
		}

		if (this.action) {
			this.action.apply(char);
		} else {
			char.log('Nothing seems to happen.');
		}

	}

}