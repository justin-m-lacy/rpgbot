import { type IMod, ModState, SymMod } from "@/model/imod";
import type { Numeric } from "@/model/types";

const PER_CHAR = ':';
const PerRegEx = /^(\d+\.?\d*)?\:(\d+\.?\d*)?$/;

export const IsPerMod = (v: string) => PerRegEx.test(v);

/// Applies modifier per quantity of source object.
export class PerMod implements IMod {

	toJSON() { return this.value + PER_CHAR + this.per; }
	toString() { return this.value + PER_CHAR + this.per }

	readonly [SymMod] = true;

	[Symbol.toPrimitive]() {
		return this.value;
	}

	/// @property {number} count - apply modulus mod once per modulus factor.
	get count() {
		return this.source ? Math.floor(+(this.source) / this.per) : 0;
	}

	readonly source: Numeric;

	readonly id: string;

	value: number = 0;

	/// @property per - value applied only once for every count of `per` units in source.
	/// mod count = Math.floor( source.value / per )
	private per: number = 1;

	constructor(id: string, vars: { bonus: Numeric, per: Numeric } | string, source: Numeric = 0) {

		this.id = id;

		this.source = source;

		if (typeof vars === 'object') {

			this.value = Number(vars.bonus);
			this.per = Number(vars.per);

		} else if (typeof vars === 'string') {

			const parts = vars.split(PER_CHAR);

			if (parts.length === 2) {

				this.value = parts[0] ? Number(parts[0]) : 1;
				this.per = parts[1] ? Number(parts[1]) : 1;

			} else {
				console.warn('bad PerMod: ' + vars);
			}

		} else {
			throw new Error(`Invalid Per Mod: ${vars}`);
		}

	}

	applyMod(_orig: object, state: ModState): void {

		state.bonus = this.value * this.count;
	}

	instantiate() {
		return new PerMod(this.toString(), this.id, this.source);
	}
}