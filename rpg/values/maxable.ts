import { IMod, IModdable, SymModdable } from "rpg/values/imod";
import { Simple } from "rpg/values/simple";
import { IsValue, SymSimple, type ISimple, type Numeric } from "rpg/values/types";

export class Maxable implements ISimple, IModdable {

	readonly id: string;

	readonly [SymModdable] = true;
	readonly [SymSimple] = true;

	toJSON() {
		return this._value === this.max.value ?
			this._value : { v: this._value, m: this.max }
	}

	/**
	 * Decode stored value.
	 * @param data 
	 */
	/*revive(data: any) {
		if (typeof data === 'number') this.setTo(data);
		else if (typeof data === 'object') {
			this.value = data.v;
			this.setMax(data.m);
		} else {
			this.setTo(0);
		}
	}*/

	valueOf() { return this._value }

	private _value: number = 0;
	get value() { return this._value }
	set value(v) {
		this._value = Math.min(v, this.max.value);
	}

	get base() { return this._value; }
	set base(v) { this._value = v; }

	addMod(mod: IMod) {
		this.max.addMod(mod);
	}
	removeMod(mod: IMod) {
		this.max.removeMod(mod);
	}

	readonly max: Simple;

	add(v: number) {
		this.value += v;
	}

	setMax(base: Numeric) {
		this.max.setTo(base);
	}

	/**
	 * Sets both current and max to same value.
	 * @param v 
	 */
	setTo(v: Numeric | { v: number, m: number }) {

		if (typeof v === 'number') {
			this.value = this.max.value = v;
		} else if (IsValue(v)) {
			this.value = this.max.value = v.valueOf();
		} else {
			this.value = v.v;
			this.max.value = v.m;
		}

	}

	constructor(id: string) {

		this.id = id;
		this.max = new Simple(id + '.' + 'max');

	}


}