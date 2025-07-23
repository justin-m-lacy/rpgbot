import { BadTypeError } from 'rpg/util/errors';
import { CanMod, IMod, IModdable, SymModdable } from 'rpg/values/imod';
import { AsModded } from 'rpg/values/modding';
import { ISimple, SymSimple } from './types';
const rollex = /^([+-]?\d*)?d([+-]?\d*)([+-]?\d+)?/;

const MaxRoll = 99999;
const MaxBonus = 999999;

const minmax = (v: number, min: number, max: number) => {
	return (v < min) ? min : (v > max ? max : v);
}

export const IsDiceRoll = (str: string) => {
	return rollex.test(str);
}

export const ExecRoll = (str: string) => {

	const res = rollex.exec(str);
	if (res === null) return roll(1, 6);

	let num = minmax(parseInt(res[1]), -MaxRoll, MaxRoll);
	let sides = minmax(parseInt(res[2]), -MaxBonus, MaxBonus);
	let bonus = minmax(parseInt(res[3]), -MaxBonus, MaxBonus);

	if (Number.isNaN(num)) num = 1;
	if (Number.isNaN(sides)) sides = 6;
	if (Number.isNaN(bonus)) bonus = 0;

	let tot = bonus;

	if (num < 0) {
		num = -num;
		sides = -sides;
	}

	while (num-- > 0) tot += Math.floor(sides * Math.random()) + 1;
	return tot;

}

export const roll = (count: number, sides: number, bonus: number = 0) => {

	let tot = bonus;

	if (count < 0) {
		count = -count;
		sides = -sides;
	}

	while (count-- > 0) tot += Math.floor(sides * Math.random()) + 1;
	return tot;

}


export class Dice implements IModdable, ISimple {

	readonly [SymSimple]: true = true;
	readonly [SymModdable] = true;

	static Parse(str: string) {

		const res = rollex.exec(str)!;
		return new Dice(
			Number.parseInt(res[1]),
			Number.parseInt(res[2]),
			Number.parseInt(res[3]));

	}

	static Decode(json: string) {
		if (typeof (json) === 'string') return Dice.Parse(json);
		throw new BadTypeError(typeof json, 'string');
	}

	toJSON() {

		return `${this.n}d${this.sides}` +
			(this.base > 0 ? `+${this.base}` :
				(this.base < 0 ? `${this.base}` : '')
			);

	}

	get value() { return this.valueOf() }
	set value(v: number) { }

	id: string = 'dice';

	readonly n: number;
	readonly sides: number;
	base: number;

	constructor(count: number = 1, sides: number = 0, bonus: number = 0) {

		if (count < 0) {
			count = -count;
			sides = -sides;
		}
		if (Number.isNaN(count)) count = 1;
		if (Number.isNaN(bonus)) bonus = 0;

		this.sides = sides;
		this.n = count;

		this.base = bonus;

	}

	addMod(mod: IMod) {
		AsModded(this, 'base', this.base)!.addMod(mod);
	};

	removeMod(mod: IMod) {
		if (CanMod(this.base)) {
			this.base.removeMod(mod);
		}
	};

	add(amt: number): void {
		this.base += amt;
	}
	setTo(v: number): void {
		this.base = v;
	}

	toString() { return this.toJSON(); }

	valueOf() {

		let tot = this.base;
		let i = this.n;

		while (i-- > 0) tot += Math.floor(this.sides * Math.random() + 1);
		return tot;


	}

}