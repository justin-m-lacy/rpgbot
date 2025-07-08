import { ParseValue } from 'rpg/parsers/values';
import type { Numeric, TValue } from 'rpg/values/types';
import { Dice } from './values/dice';

export class DamageSrc implements TValue {

	static Decode(json: string | { dmg: any, type?: string }) {

		if (typeof (json) === 'string') {
			return new DamageSrc(ParseValue(json));
		} else {

			if (json.dmg) {
				return new DamageSrc(Dice.Parse(json.dmg), json.type);
			} else {
				return new DamageSrc(new Dice(json.count, json.sides, json.bonus), json.type);
			}

		}
	}

	toJSON() { return { dmg: this.value.toString(), type: this.type }; }

	valueOf() {
		return this._val.valueOf();
	}

	get value() { return this._val.valueOf() }
	set value(v) { typeof this._val === 'number' ? this._val = v : this._val.value = v; }

	bonus: number = 0;
	private _val: Numeric;
	type: string;

	constructor(value?: TValue | null, type?: string) {

		this._val = value ?? 0;
		this.type = type ?? '';

	}

	toString() { return this.value.toString() + ' ' + this.type; }

	roll() { return this.value.valueOf(); }

}