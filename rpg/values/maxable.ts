import { Simple } from "rpg/values/simple";
import { SymSimple, type ISimple, type Numeric } from "rpg/values/types";

export class Maxable implements ISimple {

	readonly id: string;

	readonly [SymSimple] = true;

	toJSON() {
		return this._value === this.max.value ?
			this._value : { v: this._value, m: this.max.toJSON() }
	}

	valueOf() { return this._value }

	private _value: number = 0;
	get value() { return this._value }
	set value(v) {
		this._value = Math.min(v, this.max.value);
	}

	get base() { return this._value; }

	readonly max: Simple;

	add(v: number) {
		this.value += v;
	}

	setMax(base: Numeric) {
		this.max.setTo(base);
	}
	setTo(v: Numeric) {
		this.max.value = +v;
		this.value = +v;
	}

	constructor(id: string) {

		this.id = id;
		this.max = new Simple(id + '.' + 'max');

	}


}