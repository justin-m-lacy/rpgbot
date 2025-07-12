import { TValue } from './types';
const rollex = /^([\+\-]?\d*)?d([\+\-]?\d*)([\+\-]?\d+)?/;

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


export class Dice implements TValue {

	static Parse(str: string) {

		const res = rollex.exec(str)!;
		return new Dice(
			Number.parseInt(res[1]),
			Number.parseInt(res[2]),
			Number.parseInt(res[3]));

	}

	static Decode(json: string) {
		if (typeof (json) === 'string') return Dice.Parse(json);
	}

	toJSON() {

		return `${this.n}d${this.sides}` +
			(this.bonus > 0 ? `+${this.bonus}` :
				(this.bonus < 0 ? `-${this.bonus}` : '')
			);

	}

	get value() { return this.valueOf() }
	set value(v: number) { }

	readonly n: number;
	readonly sides: number;
	bonus: number;

	constructor(count: number = 1, sides: number = 0, bonus: number = 0) {

		if (count < 0) {
			count = -count;
			sides = -sides;
		}
		if (Number.isNaN(count)) count = 1;
		if (Number.isNaN(bonus)) bonus = 0;

		this.sides = sides;
		this.n = count;

		this.bonus = bonus;

	}

	toString() { return this.toJSON(); }

	valueOf() {

		let tot = this.bonus;
		let i = this.n;

		while (i-- > 0) tot += Math.floor(this.sides * Math.random() + 1);
		return tot;


	}

}