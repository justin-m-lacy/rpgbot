import { IsSimple, SymSimple, type ISimple, type Numeric } from "rpg/values/types";


/**
 * Value that sets target to this value.
 */
export class Setter implements ISimple {

	readonly id: string;

	valueOf() { return this._value.valueOf() }

	get value() { return this._value.valueOf(); }
	set value(v) { this._value = v; }

	get base() {
		return IsSimple(this._value) ?
			this._value.base : this._value.valueOf();
	}

	private _value: Numeric;

	readonly [SymSimple] = true;

	constructor(id: string, v: Numeric) {

		this.id = id;
		this._value = v;

	}
	setTo(v: Numeric): void {
		if (IsSimple(this._value)) {
			this._value.setTo(v)
		} else if (typeof this._value === 'number') {
			this._value = v.valueOf();
		} else {
			this._value.value = v.valueOf();
		}
	}

	add(amt: number): void {
		if (typeof this._value === 'number') {
			this._value += amt;
		} else this._value.value += amt;
	}

}