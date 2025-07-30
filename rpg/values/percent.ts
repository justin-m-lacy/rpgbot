import { precise } from "rpg/util/format";
import { CanMod, IMod, IModdable, SymModdable } from "rpg/values/imod";
import { AsModded } from "rpg/values/modding";
import { Numeric, SymSimple, type Id, type ISimple } from "rpg/values/types";

type PercentData = `${number}%`;

const PctTest = /^(\d+(?:\.\d+)?)\%$/i

/// 50%:7 - 50% chance for value 7
const PctCountTest = /^(\d+(?:\.\d+)?)\%\:(.+)$/i;

export const IsPctValue = (str: string): str is `${number}%:${number}` => {
	return PctCountTest.test(str);
}


export const ParsePercent = (data: PercentData | number, id: string = 'pct') => {

	if (typeof data === 'number') return new Percent(id, data);
	const res = PctTest.exec(data);
	return res ? new Percent(id, parseInt(res[1])) : undefined;

}

export const IsPercentData = (v?: unknown): v is PercentData => {
	return typeof v === 'string' && PctTest.test(v);
}

export class Percent implements ISimple, IModdable {

	readonly [SymSimple] = true;
	readonly [SymModdable] = true;

	valueOf() { return this.value; }

	/**
	 * @property pct - decimal percent.
	 */
	pct: Numeric;

	readonly id: Id;

	toJSON() { return (100 * this.pct.valueOf()) + '%'; }


	/**
	 * @property value - 1 if a random roll
	 * is below the percentile.
	 */
	get value() { return (Math.random() < this.pct.valueOf()) ? 1 : 0; }
	set value(v: number) { this.pct = v; }

	get base() { return this.pct.valueOf(); }

	/**
	 * Perform a percent roll with a percent modifier.
	 * @param [mod=0] - 100-based percent.
	 * @returns true if 100-based roll is under the percent.
	 */
	roll(mod = 0) { return 100 * Math.random() < this.pct.valueOf() * (100 + mod); }

	toString() { return precise(100 * this.pct.valueOf()) + '%'; }

	/**
	 * 
	 * @param id 
	 * @param val - percent as a 100-based number 
	 */
	constructor(id: string, val?: number) {

		this.id = id;
		this.pct = (val ?? 0) / 100;

	}

	addMod(mod: IMod) {
		AsModded(this, 'pct', this.pct)!.addMod(mod);
	};

	removeMod(mod: IMod) {
		if (CanMod(this.pct)) {
			this.pct.removeMod(mod);
		}
	};

	setTo(v: number) {
		if (typeof this.pct === 'number') {
			this.pct = v;
		} else {
			this.pct.value = v;
		}
	}

	add(amt: number): void {
		if (typeof this.pct === 'number') {
			this.pct += amt;
		} else {
			this.pct.value += amt;
		}
	}

	clone() {
		return new Percent(this.id, 100 * this.pct.valueOf());
	}

}