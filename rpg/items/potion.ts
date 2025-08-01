import { GetDot, ProtoDot } from 'rpg/effects/dots.js';
import { ItemProto, ItemType } from 'rpg/items/types';
import { Char } from '../char/char';
import { type Game } from '../game';
import { Item, TStacker } from './item';

export class Potion extends Item implements TStacker {

	static Decode(json: any) {

		const p = new Potion(json);

		if (json.effect) p.effect = json.effect;

		p.count = typeof (json.n === 'number') ? json.n : 1;


		Item.SetProtoData(json, p);

		return p;

	}

	toJSON() {

		const s = super.toJSON() as any;

		if (this.count != 1) s.n = this.count;

		//if (this._spell) s.spell = this._spell;
		if (this.dot) s.effect = this.dot;

		return s;

	}

	get effect() { return this.dot; }
	set effect(v) { this.dot = v; }

	get stack() { return true; }

	count: number = 1;
	dot?: ProtoDot;

	constructor(opts?: ItemProto) {
		super(opts);
		this.type = ItemType.Potion;
	}

	use(_: Game, char: Char) {

		char.log(`${char.name} quaffs ${this.name}.`);
		char.addHistory('quaff');

		char.removeN(this);

		if (this.dot) {

			if (typeof (this.dot) === 'string') {

				let e = GetDot(this.dot);
				if (!e) {
					console.log('dot not found: ' + this.dot);
					return;
				}

				char.addDot(e, this.name);

			} else if (this.dot instanceof ProtoDot) {
				char.addDot(this.dot, this.name);
			}

		}

	}

}