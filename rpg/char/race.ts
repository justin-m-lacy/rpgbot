import type { Char } from "rpg/char/char";
import type { IMod } from "rpg/values/imod";
import type { TValue } from "rpg/values/types";

export class Race {

	readonly id: string;
	readonly name: string;

	desc?: string;

	/**
	 * Initial values character. Not mods but
	 * permanent changes like starting gold.
	 */
	private createVals: Record<string, TValue> = {};

	private _mods: Record<string, IMod> = {};
	private hitdice: number = 0;
	private _expMod: number = 1;
	talents: string[] = [];

	constructor(id: string, hitdice: number = 1) {

		this.id = this.name = id;
		this.hitdice = hitdice;

	}

	addCharMod(m: IMod) {
		this._mods[m.id] = m;

	}

	addCreateValue(k: string, v: TValue) {
		this.createVals[k] = v;
	}

	onInitChar(char: Char) {
		char.applyMods(this.mods);
	}

	onNewChar(char: Char) {

		for (let k in this.createVals) {

			const val = this.createVals[k];
			char[k] += val.value;

		}

	}

	hasTalent(t: string) {
		return this.talents && this.talents.includes(t);
	}

	get HD() { return this.hitdice; }
	get mods() { return this._mods }
	get expMod() { return this._expMod; }

}

export const GClass = Race;
export type GClass = InstanceType<typeof GClass>;