import { asProxy } from 'rpg/util/proxy';
import { IMod, type IModdable, SymModdable } from "rpg/values/imod";
import type { Id, Idable, TValue } from "../types";

/// Create modded proxy for target.
export const ToModded = <T extends TValue & Idable>(targ: T): IModdable => {

	const modded = {

		[SymModdable]: true as true,

		valueOf() { return this._cached },

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