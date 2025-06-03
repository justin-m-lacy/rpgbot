import { StatMod } from "./stats";

const races: Race[] = [];

const raceByName: { [race: string]: Race } = {};

export class Race {

	static GetRace(racename?: string) {
		return racename ? raceByName[racename.toLowerCase()] : undefined;
	}

	static RandRace(racename?: string) {

		if (racename) {
			racename = racename.toLowerCase();
			if (raceByName[racename] != null) return raceByName[racename];
		}
		return races[Math.floor(races.length * Math.random())];
	}

	static Create(name: string, hitdice: any, statMods = {}) {

		const r = new Race(name);
		r.hitdice = hitdice;
		r._baseMods = statMods;

		return r;

	}

	static FromJSON(json: any) {

		const o = new Race(json.name);

		if (json.hasOwnProperty('hitdice')) {
			o.hitdice = json.hitdice;
		}

		o.desc = json.desc;

		if (json.talents) o._talents = json.talents;

		if (json.exp) o._expMod = json.exp;

		// mod stats added to base. recomputed on load
		// to allow for changes.
		if (json.baseMods) o._baseMods = json.baseMods;

		// absolute stats set once. gold, age, height, etc.
		if (json.infoMods) o._infoMods = json.infoMods;

		return o;

	}

	readonly id: string;
	readonly name: string;

	desc?: string;
	private _baseMods?: StatMod;
	private _infoMods?: StatMod;
	private hitdice: number = 0;
	private _expMod: number = 1;
	private _talents?: string[];

	constructor(id: string) {

		this.id = this.name = id;

	}

	hasTalent(t: string) {
		return this._talents && this._talents.includes(t);
	}

	get talents() { return this._talents; }

	get infoMods() { return this._infoMods; }
	get HD() { return this.hitdice; }
	get baseMods() { return this._baseMods; }
	get expMod() { return this._expMod; }

}

const initRaces = async () => {

	try {

		const raw = (await import('../data/races.json')).default;

		for (let i = raw.length - 1; i >= 0; i--) {

			const race = Race.FromJSON(raw[i]);
			raceByName[race.name] = race;
			races.push(race);

		}

	} catch (e) {
		console.error(e);
	}

}
initRaces();

