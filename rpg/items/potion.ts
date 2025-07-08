import { randomUUID } from 'crypto';
import { Formula } from 'formulic';
import { ItemType } from 'rpg/items/types';
import { GetDot, ProtoDot } from 'rpg/magic/dots';
import { Char } from '../char/char';
import { Item } from './item';

export class Potion extends Item {

	static Decode(json: any) {

		let p = new Potion(json.id);

		if (json.effect) p.effect = json.effect;
		if (json.form) p.form = json.form;

		Item.InitData(json, p);

		return p;

	}

	toJSON() {

		const s = super.toJSON() as any;

		//if (this._spell) s.spell = this._spell;
		if (this.dot) s.effect = this.dot;
		if (this._form) s.form = this._form;

		return s;

	}

	get form() { return this._form; }
	set form(v) { this._form = v; }

	get effect() { return this.dot; }
	set effect(v) { this.dot = v; }

	/*get spell() { return this._spell; }
	set spell(v) { this._spell = v; }
	_spell?: Spell;*/

	_form?: Formula | string;

	dot?: ProtoDot;

	constructor(id?: string) {
		super(id ?? randomUUID(), { name: '', desc: '', type: ItemType.Potion });
	}

	quaff(char: Char) {

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