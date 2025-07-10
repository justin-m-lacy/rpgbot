import { ItemData, ItemType } from 'rpg/items/types';
import { Action, GetAction } from 'rpg/magic/action';
import { type Loc } from 'rpg/world/loc';
import { Char } from '../char/char';
import { Item } from '../items/item';

export class Feature extends Item {

	get fb() { return this._fb; }
	set fb(b) { this._fb = b; }

	/**
	 * feedback when using item.
	 */
	private _fb?: string;

	static Decode(
		json: ItemData & { desc: string, action?: string, fb?: string }) {

		const f = new Feature(json.name, json.desc);

		if (json.action) {
			f.action = GetAction(json.action);
		}
		if (json.fb) f.fb = json.fb;

		return Item.InitData(json, f) as Feature;

	}

	toJSON() {

		const ob = super.toJSON() as any;

		if (this.action) ob.action = this.action.name;
		if (this.fb) ob.fb = this.fb;

		return ob;

	}

	action?: Action;

	constructor(name: string, desc: string) {
		super(undefined, { name: name, desc: desc, type: ItemType.Feature });
	}

	/**
	 * override func for char enter location.
	 * @param char
	 * @param loc 
	 */
	onEnter?: (f: typeof this, char: Char, loc: Loc) => void;

	use(char: Char) {

		if (this._fb) {
			char.send(this._fb.replace('%c', char.name) + ' ');
		}

		if (this.action) {
			return this.action.apply(char);
		}
		char.send("Nothing happens.");
		return false;

	}

}