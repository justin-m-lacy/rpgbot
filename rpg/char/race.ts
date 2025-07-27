import { GenItem } from "rpg/builders/itemgen";
import type { Char } from "rpg/char/char";
import { AddValues } from "rpg/values/apply";
import type { IMod } from "rpg/values/imod";
import { NewPath, Path } from "rpg/values/paths";
import type { TValue } from "rpg/values/types";

export class Race {

	readonly id: string;
	readonly name: string;

	desc?: string;

	/**
	 * Initial values for char. Not stat mods but
	 * permanent changes like starting gold.
	 */
	private createVals: Path<TValue> = NewPath('creates');

	readonly mods: Record<string, IMod> = {};
	private hitDie: number = 0;
	private _expMod: number = 1;
	readonly talents: string[] = [];

	// minimum levels required to select this race/class.
	readonly minLevels: number;

	/**
	 * Starting items for race/class.
	 */
	readonly items: string[] = [];

	constructor(id: string, hitDie: number = 1, minLevels: number = 0) {

		this.id = this.name = id;
		this.minLevels = minLevels;

		this.hitDie = hitDie;

	}

	addCharMod(m: IMod) {
		this.mods[m.id] = m;

	}

	/**
	 * Add an initial stat value set by race.
	 * @param k 
	 * @param v 
	 */
	addCreateValue(k: string, v: TValue) {
		this.createVals[k] = v;
	}

	onInitChar(char: Char) {
		char.applyMods(this.mods);
	}

	/**
	 * Runs on new char creation.
	 * @param char 
	 */
	onNewChar(char: Char) {

		const cur = char.hp.max.base;
		char.hp.setTo(cur + this.hitDie);

		for (let i = this.items.length - 1; i >= 0; i--) {
			GenItem(this.items[i], char.inv);

		}

		AddValues(char, this.createVals);

	}

	hasTalent(t: string) {
		return this.talents.includes(t);
	}

	get HD() { return this.hitDie; }
	get expMod() { return this._expMod; }

}

export const GClass = Race;
export type GClass = InstanceType<typeof GClass>;