import type { Char } from "rpg/char/char";
import { AddValues } from "rpg/values/apply";
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
	private hitDie: number = 0;
	private _expMod: number = 1;
	readonly talents: string[] = [];

	constructor(id: string, hitDie: number = 1) {

		this.id = this.name = id;
		this.hitDie = hitDie;

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

		const cur = char.hp.max.base;
		char.hp.setTo(cur + this.hitDie);

		AddValues(char, this.createVals);

	}

	hasTalent(t: string) {
		return this.talents.includes(t);
	}

	get HD() { return this.hitDie; }
	get mods() { return this._mods }
	get expMod() { return this._expMod; }

}

export const GClass = Race;
export type GClass = InstanceType<typeof GClass>;