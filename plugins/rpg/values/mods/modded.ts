import { IMod, type IModdable, SymModdable as SymModded } from '@/model/imod';
import type { Id, Idable, ISimple, TValue } from "@/model/types";
import { SymSimple } from "@/model/types";
import { precise, smallNum } from "@/util/format";
import { asProxy } from "@/util/proxy-utils";
import { shallowRef } from 'vue';

/// Create modded proxy for target.
export const ToModded = <T extends TValue & Idable>(targ: T): IModdable => {
	const modded = {

		[SymSimple]: true as true,
		[SymModded]: true as true,

		[Symbol.toPrimitive]() {
			return this._cached.value;
		},

		toString() { return smallNum(this._cached.value) },

		toJSON() {
			return (this.targ as any).toJSON?.() ?? this.base;
		},

		targ,
		mods: new Map<Id, IMod>(),

		/// cached value.
		_cached: shallowRef(0),

		get value(): number { return this._cached.value; },

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

			this._cached.value = (this.targ.value + state.bonus)
				* (1 + state.pct * state.pctMult);

		},

	}

	return asProxy(modded, targ);
}


export class Modded implements TValue, ISimple, IModdable {

	toJSON() { return this._base.value; }

	readonly [SymSimple] = true;
	readonly [SymModded] = true;

	[Symbol.toPrimitive]() { return this._cached.value; }
	toString() { return precise(this.value); }

	readonly mods = new Map<Id, IMod>();

	private readonly _base = shallowRef(0);
	get base() { return this._base.value }
	set base(v) { this._base.value = v; }

	private _busy = false;

	/// cached value.
	private _cached = shallowRef(0);

	get value(): number { return this._cached.value; }
	set value(v: number) {
		if (v !== this._base.value) {
			this._base.value = v;
			if (!this._busy) this.recalc();
		}
	}

	readonly id: string;

	constructor(id: string, base: number = 0) {

		this.id = id;
		this._base.value = base;

	}
	add(v: number): void {
		this._base.value += v;
		if (!this._busy) {
			this.recalc();
		}
	}

	addMod(m: IMod) {

		this.mods.set(m.id, m);
		if (!this._busy) {
			this.recalc();
		}

		return this;
	}

	removeMod(m: IMod) {

		if (!this.mods.has(m.id)) return;

		this.mods.delete(m.id);

		if (!this._busy) {
			this.recalc();
		}

	}


	recalc() {

		this._busy = true;

		const state = {
			pct: 0,
			bonus: 0,
			pctMult: 1
		}
		for (const m of this.mods.values()) {
			m.applyMod(this, state);
		}

		this._cached.value = (this._base.value + state.bonus)
			* (1 + state.pct * state.pctMult);

		this._busy = false;

	}

}

/**
 * Patch modding capability into an object
 * @param targ 
 * @returns 
 */
/*export function PatchModding<T extends TValue & Idable>(targ: T): T & IModdable {

	if (SymModdable in targ) return targ as T & IModdable;

	const mods = new Map<Id, TMod>();
	const _cached = shallowRef<number>(targ.value);

	Object.defineProperty(targ, Symbol.toPrimitive, {
		value: () => _cached.value
	});

	const recalc = () => {

		const state = {
			baseValue: targ.value,
			pct: 0,
			bonus: 0,
			pctMult: 0
		}
		for (const mod of mods.values()) {
			mod.applyMod(targ, state);
		}

		_cached.value = (targ.value + state.bonus)
			* (1 + state.pct * state.pctMult);

	}

	Object.defineProperty(targ, 'addMod', {
		value: (mod: TMod) => {
			mods.set(mod.id, mod);
			recalc();
			return targ;
		}
	});

	Object.defineProperty(targ, 'removeMod', {
		value: function (mod: TMod) {

			if (mods.delete(mod.id)) {
				recalc();
			}

		}
	});

	if (!(SymSimple in targ)) {
		Object.defineProperty(targ, SymSimple, {
			value: true
		});
	}

		toJSON() {
			return (targ as any).toJSON?.() ?? this.base;
		}

		get value(): number { return _cached.value; },

		/// Gets the underlying unmodded value.
		get base() { return this.target.value },
		set base(v: number) { this.target.value = v; }

	return targ as T & IModdable;
}*/