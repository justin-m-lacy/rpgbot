import { IMod } from "rpg/values/imod";
import { SymSimple, type ISimple, type Numeric } from 'rpg/values/types';

export class Simple implements ISimple {

	readonly [SymSimple] = true;

	toJSON() { return this._base }
	valueOf() { return this._value }

	readonly id: string;

	readonly mods = new Map<string, IMod>();

	/**
	 * cached value.
	 */
	private _value: number = 0;

	/**
	 * base value before mods.
	 */
	private _base: number = 0;

	get value() { return this._value; }
	set value(v) {
		this._base = v;
		this.recalc();
	}

	get base() { return this._base }
	set base(v) {
		this._base = v;
		this.recalc();

	}

	setTo(v: Numeric) {
		this._base = +v;
		this.recalc();
	}

	constructor(id: string, v: number = 0) {
		this.id = id;
		this._base = this._value = v
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

		this._value = (this._base + state.bonus)
			* (1 + state.pct * state.pctMult);

	}

}