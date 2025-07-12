import { Formula } from 'formulic';
import { ItemType } from 'rpg/items/types';
import { GetDot, ProtoDot } from 'rpg/magic/dots';
import { Char } from '../char/char';
import { type Game } from '../game';
import { Item, TStacker } from './item';

export class Potion extends Item implements TStacker {

	static Decode(json: any) {

		let p = new Potion(json.id);

		if (json.effect) p.effect = json.effect;
		if (json.form) p.form = json.form;

		p.count = typeof (json.n === 'number') ? json.n : 1;


		Item.InitData(json, p);

		return p;

	}

	toJSON() {

		const s = super.toJSON() as any;

		if (this.count != 1) s.n = this.count;

		//if (this._spell) s.spell = this._spell;
		if (this.dot) s.effect = this.dot;
		if (this._form) s.form = this._form;

		return s;

	}

	get form() { return this._form; }
	set form(v) { this._form = v; }

	get effect() { return this.dot; }
	set effect(v) { this.dot = v; }

	get stack() { return true; }

	count: number = 1;

	_form?: Formula | string;

	dot?: ProtoDot;

	constructor(id?: string) {
		super(id, { name: '', desc: '', type: ItemType.Potion });
	}

	use(game: Game, char: Char) {

		char.output(`${char.name} quaffs ${this.name}.`);
		char.addHistory('quaff');

		if (--this.count <= 0) {
			char.removeItem(this);
		}

		if (this._form) {

			if (typeof this._form === 'string') {
				const f = Formula.TryParse(this._form);
				if (f !== false) this._form = f;
			}
			if (this._form instanceof Formula) {
				this._form.eval(char);
			}

		} else if (this.dot) {

			if (typeof (this.dot) === 'string') {

				let e = GetDot(this.dot);
				if (!e) {
					console.log('effect not found: ' + this.dot);
					return;
				}

				console.log('adding potion effect.');
				char.addDot(e, this.name);

			} else if (this.dot instanceof ProtoDot) {
				char.addDot(this.dot, this.name);
			}

		}

	}

}