import type { Numeric, TValue } from 'rpg/values/types';
import { Dice } from './values/dice';

export class DamageSrc {

	static FromString(dmg: string, type?: string) {
		return new DamageSrc(Dice.Parse(dmg), type);
	}

	static Decode(json: any) {

		if (typeof (json) === 'string') {
			return new DamageSrc(Dice.Parse(json));
		} else {

			if (json.dmg) {
				return new DamageSrc(Dice.Parse(json.dmg), json.type);
			} else {
				return new DamageSrc(new Dice(json.count, json.sides, json.bonus), json.type);
			}

		}
	}

	toJSON() { return { dmg: this.value.toString(), type: this.type }; }

	bonus: number = 0;
	value: Numeric;
	type: string;

	constructor(value?: TValue | null, type?: string) {

		this.value = value ?? 0;
		this.type = type ?? '';

	}

	toString() { return this.value.toString() + ' ' + this.type; }

	roll() { return this.value.valueOf(); }

}