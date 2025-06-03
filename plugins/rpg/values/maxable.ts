import { Simple } from "plugins/rpg/values/simple";

export class Maxable {

	readonly id: string;

	toJSON() {
		return this._value === this.max.value ? this._value : { v: this._value, m: this.max.toJSON() }
	}

	valueOf() { return this._value }

	private _value: number = 0;
	get value() { return this._value }
	set value(v) {
		this._value = Math.min(v, this.max.value);
	}

	readonly max: Simple;

	setMax(base: number) {
		this.max.setTo(base);
	}
	setTo(v: number) {
		this.max.value = v;
		this.value = v;
	}

	constructor(id: string) {

		this.id = id;
		this.max = new Simple(id + '.' + 'max');

	}


}