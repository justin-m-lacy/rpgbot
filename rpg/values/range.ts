import { precise } from "rpg/util/format";
import { CanMod, SymModdable, type IModdable } from "rpg/values/imod";
import { AsModded } from "rpg/values/modding";
import { SymSimple, type Id, type ISimple, type Numeric, type TValue } from "rpg/values/types";
import { IMod } from './imod';

type RangeData = `${number}~${number}`;

const RangeTest = /^\-?\d+\.?\d*\~\-?\d+\.?\d*$/i;

const SPLIT_CHAR = '~';

export const IsRangeData =
	(v: unknown): v is RangeData => typeof v === 'string' && RangeTest.test(v);

export class Range implements IModdable, ISimple {

	readonly [SymSimple] = true;
	readonly [SymModdable] = true;

	valueOf() {
		return this.value;
	}

	toJSON() { return JSON.stringify(this.min) + SPLIT_CHAR + JSON.stringify(this.max); }

	toString() {
		return (this.min == this.max) ? precise(this.min).toString() :
			precise(this.min) + ' ' + SPLIT_CHAR + ' ' + precise(this.max);
	}

	readonly id: Id;
	min: number | TValue;
	max: number | TValue;

	get base() { return typeof this.min === 'number' ? this.min : this.min.value }

	/// Getting range value returns a random number in range.
	get value() {
		return (+this.min) + Math.random() * (+this.max - +this.min);
	}
	/// Setting range value sets min and max to identical value.
	set value(v) {

		if (typeof this.min === 'object') { this.min.value = v }
		else this.min = v;

		if (typeof this.max === 'object') { this.max.value = v }
		else this.min = v;

	}

	clone() {

		/// ts-compiler can't follow ternary logic.

		let min: number, max: number;

		if (typeof this.min === 'number') {
			min = this.min;
		} else if (CanMod(this.min)) {
			min = this.min.value;
		} else {
			min = this.min.value;
		}

		if (typeof this.max === 'number') {
			max = this.max;
		} else if (CanMod(this.max)) {
			max = this.max.value;
		} else {
			max = this.max.value;
		}

		return new Range({
			min,
			max
		}, this.id);
	}

	/**
	 */
	constructor(min: RangeData | number | { min: number, max: number }, id?: Id) {

		this.id = id ?? '';

		if (typeof min === 'string') {

			let parts = min.split(SPLIT_CHAR);
			this.min = +parts[0];
			this.max = +parts[1];

		} else if (typeof min === 'object') {

			this.min = min.min;
			this.max = min.max;

		} else {

			this.min = this.max = Number(min);

		}

	}

	setTo(v: number): void {
		if (typeof this.min === 'number') {
			this.min = v;
		} else {
			this.min.value = v;
		}
	}


	/// test if number is within range, endpoint inclusive.
	contains(v: number) {
		return v >= +(this.min) && v <= +(this.max);
	}

	/// get percent of range value.
	percent(pct: number) {
		return +(this.min) + pct * (+(this.max) - +(this.min));
	}

	addMod(mod: IMod,) {

		AsModded(this, 'min', this.min)!.addMod(mod);
		AsModded(this, 'max', this.max)!.addMod(mod);;

	}

	removeMod(mod: IMod) {
		if (CanMod(this.min)) this.min.removeMod(mod);
		if (CanMod(this.max)) this.max.removeMod(mod);
	}


	/// Amount added to both min and max
	add(amt: Numeric | Range) {

		console.warn('Adding to range: ' + amt);

		if (typeof amt === 'number') {
			this.addMin(amt);
			this.addMax(amt);
		} else if (typeof amt === 'object') {

			if (amt instanceof Range) {
				this.addMin(amt.min);
				this.addMax(amt.max);
			} else {
				this.addMin(amt.value);
				this.addMax(amt.value);
			}

		}

	}
	private addMin(v: Numeric) {
		if (typeof this.min === 'number') {
			this.min += +(v);
		} else {
			this.min.value += +(v);
		}
	}
	private addMax(v: Numeric) {
		if (typeof this.max === 'number') {
			this.max += +(v);
		} else {
			this.max.value += +(v);
		}
	}

}