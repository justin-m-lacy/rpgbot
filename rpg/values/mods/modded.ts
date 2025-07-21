import { asProxy } from 'rpg/util/proxy';
import { IMod, type IModdable, SymModdable } from '../imod';
import type { Id, Idable, TValue } from "../types";

/// Create modded proxy for target.
export const ToModded = <T extends TValue & Idable>(targ: T | number): IModdable => {

	if (typeof targ == 'number') return new Modded('val', targ);

	const modded = {

		[SymModdable]: true as true,

		[Symbol.toPrimitive]() { return this._cached; },

		toString() { return this._cached.toString() },

		toJSON() {
			return (this.targ as any).toJSON?.() ?? this.base;
		},

		targ,
		mods: new Map<Id, IMod>(),

		/// cached value.
		_cached: 0,

		get value(): number { return this._cached; },

		/// Get underlying unmodded value.
		get base() { return this.targ.value },
		set base(v: number) { this.targ.value = v; },

		addMod(m: IMod) {

			this.mods.set(m.id, m);
			this.recalc();

			return this;
		},

		removeMod(m: IMod) {

			if (this.mods.delete(m.id)) {
				this.recalc();
			}

		},

		recalc() {

			const state = {
				pct: 0,
				bonus: 0,
				pctMult: 1
			}
			for (const m of this.mods.values()) {

				m.applyMod(this.targ, state);

			}

			this._cached = (this.targ.value + state.bonus)
				* (1 + state.pct * state.pctMult);

		}

	}

	return asProxy(modded, targ);
}


export class Modded implements TValue, IModdable {

	toJSON() { return this._base; }

	readonly [SymModdable] = true;

	valueOf() { return this._cached; }
	toString() { return this.value.toString(); }

	readonly mods = new Map<Id, IMod>();

	private _base: number = 0;
	get base() { return this._base }
	set base(v) {
		this._base = v;
		this.recalc();
	}

	/// cached value.
	private _cached: number = 0;

	get value(): number { return this._cached; }
	set value(v: number) {
		if (v !== this._base) {
			this._base = v;
			this.recalc();
		}
	}

	readonly id: string;

	constructor(id: string, base: number = 0) {

		this.id = id;
		this._base = base;

	}
	add(v: number): void {
		this._base += v;
		this.recalc();

	}

	addMod(m: IMod) {

		this.mods.set(m.id, m);
		this.recalc();

		return this;
	}

	removeMod(m: IMod) {

		if (!this.mods.has(m.id)) return;

		this.mods.delete(m.id);

		this.recalc();

	}


	recalc() {

		const state = {
			pct: 0,
			bonus: 0,
			pctMult: 1
		}
		for (const m of this.mods.values()) {
			m.applyMod(this, state);
		}

		this._cached = (this._base + state.bonus)
			* (1 + state.pct * state.pctMult);


	}

}