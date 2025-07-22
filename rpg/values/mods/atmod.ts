
import { StrMod } from "rpg/parsers/mods";
import { type IMod, ModState, SymMod } from "rpg/values/imod";
import { Simple } from "../simple";
import type { Id, Numeric } from "../types";

const AT_SYM = '?';

/** '<=0?-20' Simple old-style at-mod still works.
* Recursive at mod: parses second mod to apply after 'at' condition:
* '>=4?(+5%)' ==> after source >= 4, add 5% mod
* use '^' to enable scaling after the cut point:
* '>4?(+5%)*' means after source >4, add %5 for every point of source.
*/
const AtRegEx = (() => {

	const op = '([<>]=?)';
	const atVal = String.raw`(-?[0-9]*(?:\.[0-9]+)?)`;
	/// unknown recursive mod.
	const mod = String.raw`\((.+)\)`;

	return new RegExp(
		String.raw`${op}?${atVal}?\?${mod}(\*)?$`
	);

})();

export const IsAtMod = (v: string) => AtRegEx.test(v);

export enum Comp {
	EQ = 1,
	GT = 2,
	LT = 4,
	GTE = GT + EQ,
	LTE = LT + EQ
}

const ParseOp = (s: string | undefined) => {

	if (s === '>') return Comp.GT;
	else if (s === '>=') return Comp.GTE;
	else if (s === '<') return Comp.LT;
	else if (s === '<=') return Comp.LTE;

	return Comp.EQ;

}

export const parseAtMod = (id: string, str: string, source?: Numeric) => {

	const res = AtRegEx.exec(str)
	if (!res) return undefined;

	const child = res[3] ? StrMod(res[3], id, new Simple('value')) : undefined;
	if (!child) {
		console.error(`Invalid At SubMod: ${child}`);
		return undefined;
	}

	return new AtMod(id,
		{
			op: res[1] ? ParseOp(res[1]) : undefined,
			at: parseInt(res[2]),
			child,
			/// scaling indicator.
			scale: res[res.length - 1] != undefined
		},
		source);

}

/// Apply modifier only once, or not at all.
export class AtMod implements IMod {

	toJSON() { return this._op + this.at + AT_SYM + JSON.stringify(this._child) }
	toString() { return this._child.toString() + ' (once)'; }

	[Symbol.toPrimitive]() {
		return this.value;
	}

	readonly [SymMod] = true;

	readonly id: string;

	/// source value at which mod value will be applied.
	at: number;

	/// comparison operator to use when testing 'at' value.
	private _op: Comp;

	/// whether Mod will continue to scale with source.value
	/// after reaching the 'at' point.
	readonly scales: boolean;

	get value() {
		return (this._child as any).value ?? 0;
	}

	set count(_v: number) {
		///ignore
	}
	/// number of times to apply
	get count() {

		if (!this.source) return 0;

		const srcVal = +(this.source);
		const amt = this.scales ? srcVal : 1;

		switch (this._op) {

			case Comp.GTE:
				return (srcVal >= this.at) ? amt : 0
			case Comp.GT:
				return (srcVal > this.at) ? amt : 0;
			case Comp.LTE:
				return (srcVal <= this.at) ? amt : 0;
			case Comp.LT:
				return (srcVal < this.at) ? amt : 0;
			case Comp.EQ:
				return (srcVal == this.at) ? amt : 0;
			default: return 0;

		}

	}

	readonly source: Numeric;
	private _child: IMod;

	constructor(
		id: Id,
		vars: { op?: Comp, at?: number, child: IMod, scale?: boolean },
		source: Numeric = 0) {

		this.id = id;
		this._child = vars.child;

		this.scales = vars.scale ?? false;
		this.source = source;

		if (typeof vars.at === 'number') {
			this.at = Number.isNaN(vars.at) ? 1 : vars.at;
		} else this.at = 1;
		this._op = vars.op ?? Comp.GTE;

	}

	applyMod(orig: object, state: ModState): void {

		const n = this.count;
		if (n > 0) {

			/**
			 * difficult to apply multiple times since
			 * child might manipulate current values
			 * in unexpected ways.
			 */
			for (let i = 0; i < n; i++) {
				this._child.applyMod(orig, state);
			}

		}

	}

}