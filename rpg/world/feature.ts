import { ItemData, ItemType } from 'rpg/parsers/items';
import { Char } from '../char/char';
import { Item } from '../items/item';
import * as acts from '../magic/action';

export class Feature extends Item {

	get action() { return this._action; }
	set action(v) { this._action = v; }

	get fb() { return this._fb; }
	set fb(b) { this._fb = b; }

	/**
	 * feedback when using item.
	 */
	private _fb?: string;

	static Decode(
		json: ItemData & { name: string, desc: string, action?: string, fb?: string }) {

		const f = new Feature(json.name, json.desc);

		if (json.action) {
			f.action = acts.GetAction(json.action);
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

	_action?: any;

	constructor(name: string, desc: string) {
		super(undefined, { name: name, desc: desc, type: ItemType.Feature });
	}

	use(char: Char) {

		let res = '';
		if (this._fb) {
			res += this._fb.replace('%c', char.name) + ' ';
		}

		if (this._action) {
			return res + this._action.tryApply(char);
		}
		return res + "Nothing happens.";

	}

}