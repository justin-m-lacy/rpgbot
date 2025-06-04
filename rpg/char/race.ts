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
	private createVals?: TValue[];

	private _mods?: Record<string, IMod>;
	private hitdice: number = 0;
	private _expMod: number = 1;
	talents: string[] = [];

	constructor(id: string, hitdice: number = 1) {

		this.id = this.name = id;
		this.hitdice = hitdice;

	}

	addCharMod(m: IMod) {
		this._mods ??= {};
		this._mods[m.id] = m;

	}

	addCreateValue(v: TValue) {

		this.createVals ??= [];
		this.createVals.push(v);

	}

	onNewChar(char: Char) {

	}

	hasTalent(t: string) {
		return this.talents && this.talents.includes(t);
	}

	get infoMods() { return this.mods; }
	get HD() { return this.hitdice; }
	get mods() { return this._mods }
	get expMod() { return this._expMod; }

}

export const GClass = Race;
export type GClass = InstanceType<typeof GClass>;