import { ParseValue } from 'rpg/parsers/values';
import { CanMod, IMod, IModdable, SymModdable } from 'rpg/values/imod';
import { AsModded } from 'rpg/values/modding';
import { IsSimple, type Numeric, type TValue } from 'rpg/values/types';

export class DamageSrc implements TValue, IModdable {

	[SymModdable]: true = true;

	static From(dmg: string | Numeric | undefined, kind: string = 'blunt') {

		if (typeof dmg === 'string') {
			return new DamageSrc(ParseValue('dmg', dmg) ?? 0, kind);
		} else if (typeof dmg === 'number' || !dmg) {
			return new DamageSrc(dmg ?? 0, kind);
		} else {
			return new DamageSrc(dmg, kind);
		}
	}

	toJSON() { return { dmg: this.value, type: this.type }; }

	valueOf() { return this._val.valueOf(); }

	get value() { return this._val.valueOf() }
	set value(v) { typeof this._val === 'number' ? this._val = v : this._val.value = v; }

	id: string = 'dmg';

	private _val: number | (TValue);
	get base() {
		if (typeof this._val === 'number') return this._val;
		if (IsSimple(this._val)) return this._val.base;
		return this._val.value;
	}
	set base(v) {
		if (typeof this._val === 'number') this._val = v;
		else if (IsSimple(this._val)) this._val.base = v;
		else this._val.value = v;
	}
	type: string;

	constructor(value: TValue | number, type?: string) {

		this._val = value ?? 0;
		this.type = type ?? '';

	}

	addMod(mod: IMod): void {
		if (CanMod(this._val)) {
			this._val.addMod(mod);
		} else {
			AsModded(this as any, "_val", this._val)?.addMod(mod);
		}
	}
	removeMod(mod: IMod): void {
		if (CanMod(this._val)) {
			this._val.removeMod(mod);
		}
	}

	toString() { return this.value.toString() + ' ' + this.type; }

	roll() { return this.value.valueOf(); }

}