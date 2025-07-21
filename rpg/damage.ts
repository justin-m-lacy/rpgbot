import { ParseValue } from 'rpg/parsers/values';
import { CanMod, IMod, IModdable, SymModdable } from 'rpg/values/imod';
import { AsModded } from 'rpg/values/modding';
import { Simple } from 'rpg/values/simple';
import type { TValue } from 'rpg/values/types';
import { Idable } from './values/types';

export class DamageSrc implements TValue, IModdable {

	[SymModdable]: true = true;


	static Decode(json: string | { dmg: any, type?: string } | undefined) {

		if (!json) {
			return new DamageSrc(new Simple('dmg', 0), 'blunt');
		} else if (typeof json === 'number') {
			return new DamageSrc(new Simple('dmg', json), 'blunt');
		} else if (typeof (json) === 'string') {
			return new DamageSrc(ParseValue(json), 'blunt');
		} else {
			return new DamageSrc(ParseValue(json.dmg), json.type);
		}
	}

	toJSON() { return { dmg: this.value, type: this.type }; }

	valueOf() { return this._val.valueOf(); }

	get value() { return this._val.valueOf() }
	set value(v) { typeof this._val === 'number' ? this._val = v : this._val.value = v; }

	id: string = 'dmg';

	base: number = 0;
	private _val: number | (TValue & Idable);
	type: string;

	constructor(value?: (Idable & TValue) | null, type?: string) {

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