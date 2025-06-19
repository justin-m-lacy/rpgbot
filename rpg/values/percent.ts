import { precise } from "rpg/util/format";
import { SymSimple, type Id, type ISimple } from "rpg/values/types";

type PercentData = `${number}%`;

const TYPE_PCT = '%';

const PctTest = /^(\d+(?:\.\d+)?)\%$/i

/// 50%:7 - 50% chance for value 7
const PctCountTest = /^(\d+(?:\.\d+)?)\%\:(.+)$/i;

export const IsPctValue = (str: string): str is `${number}%:${number}` => {
	return PctCountTest.test(str);
}


export const ParsePercent = (data: PercentData, id: string = 'pct') => {

	const res = PctTest.exec(data);
	return res ? new Percent(id, parseInt(res[1])) : undefined;

}

export const IsPercentData = (v?: unknown): v is PercentData => {
	return typeof v === 'string' && PctTest.test(v);
}

export class Percent implements ISimple {

	readonly [SymSimple] = true;

	valueOf() {
		return this.value;
	}

	/**
	 * @property pct - decimal percent.
	 */
	private pct: number;

	readonly id: Id;

	toJSON() { return (100 * this.pct) + TYPE_PCT; }


	/**
	 * @property value - 1 if a random roll
	 * is below the percentile.
	 */
	get value() { return (Math.random() < this.pct) ? 1 : 0; }
	set value(v: number) { this.pct = v; }

	get base() { return this.pct; }

	/**
	 * Perform a percent roll with a percent modifier.
	 * @param [mod=0] - 100-based percent.
	 * @returns true if 100-based roll is under the percent.
	 */
	roll(mod = 0) { return 100 * Math.random() < this.pct * (100 + mod); }

	get type() { return TYPE_PCT }

	toString() { return precise(100 * this.pct) + '%'; }

	/**
	 * 
	 * @param id 
	 * @param val - percent as a 100-based number 
	 */
	constructor(id: string, val?: number) {

		this.id = id;
		this.pct = (val ?? 0) / 100;

	}

	setTo(v: number) {
		this.pct = v;
	}

	add(amt: number): void {
		this.pct += amt;
	}

	clone() {
		return new Percent(this.id, 100 * this.pct);
	}

}