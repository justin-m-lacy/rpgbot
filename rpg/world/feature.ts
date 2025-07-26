import { Action } from 'rpg/actions/action.js';
import { type Game } from 'rpg/game';
import { ItemInfo, ItemType } from 'rpg/items/types';
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

	constructor(opts: ItemInfo) {
		super(opts);
		this.type = opts.type ?? ItemType.Feature;
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