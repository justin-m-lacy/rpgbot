import type { TCharInfo } from "rpg/char/actor";
import type { Char } from "rpg/char/char";
import type { ModBlock } from "rpg/values/imod";
import type { TValue } from "rpg/values/types";



export class Race {

	static Create(name: string, hitdice: any, statMods = {}) {

		const r = new Race(name);
		r.hitdice = hitdice;
		r.baseStats = statMods;

		return r;

	}

	static Revive(json: any) {

		const o = new Race(json.name);

		if (json.hitdice) {
			o.hitdice = json.hitdice;
		}

		o.desc = json.desc;

		if (json.talents) o._talents = json.talents;

		if (json.exp) o._expMod = json.exp;

		// mod stats added to base. recomputed on load
		// to allow for changes.
		if (json.baseMods) o.baseStats = json.baseMods;

		// absolute stats set once. gold, age, height, etc.
		if (json.infoMods) o._infoMods = json.infoMods;

		return o;

	}

	readonly id: string;
	readonly name: string;
	desc?: string;

	private baseStats?: TValue[];
	private _infoMods?: ModBlock<TCharInfo>;
	private hitdice: number = 0;
	private _expMod: number = 1;
	private _talents?: string[];

	constructor(id: string) {

		this.id = this.name = id;

	}

	onNewChar(char: Char) {

	}

	hasTalent(t: string) {
		return this._talents && this._talents.includes(t);
	}

	get talents() { return this._talents; }

	get infoMods() { return this._infoMods; }
	get HD() { return this.hitdice; }
	get baseMods() { }
	get expMod() { return this._expMod; }

}

