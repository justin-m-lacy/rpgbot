import { IMod } from './imod';

export class Simple {

	readonly id: string;

	readonly mods = new Map<string, IMod>();

	/**
	 * cached value.
	 */
	private _cached: number = 0;

	/**
	 * base value before mods.
	 */
	private _base: number = 0;

	get value() { return this._cached; }
	set value(v) { this._base = v; }



	get base() { return this._base }
	set base(v) {
		this._base = v;
		this.recalc();

	}


	constructor(id: string) {

		this.id = id;

	}

	add(v: number): void {
		this._base += v;
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