import { Dice } from './values/dice';

export class DamageSrc {

	static FromString(dmg: string, type?: string) {
		return new DamageSrc(Dice.Parse(dmg), type);
	}

	static Revive(json: any) {

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

	toJSON() { return { dmg: this.roller.toString(), type: this.type }; }

	get bonus() { return this.roller.bonus; }
	set bonus(v) { this.roller.bonus = v; }
	get sides() { return this.roller.sides; }
	//set sides(v) { this.roller.sides = v; }
	get count() { return this.roller.n; }
	//set count(v) { this.roller.count = v; }

	roller: Dice;
	type: string;

	constructor(roller?: Dice | null, type?: string) {

		this.roller = roller ?? new Dice(0, 1, 0);
		this.type = type ?? '';

	}

	toString() { return this.roller.toString() + ' ' + this.type; }

	roll() { return this.roller.valueOf(); }

}