import { ParseMod } from 'rpg/parsers/mods';
import { ParseValue } from 'rpg/parsers/values';
import { Race, type GClass } from '../char/race';

type RawRaceData = typeof import('../data/races.json')[number] | typeof import('../data/classes.json')[number];

const races: Race[] = [];
const raceByName: Record<string, Race> = {};

const classes: GClass[] = [];
const classByName: Record<string, GClass> = {};

export const GetClasses = () => classes;
export const GetRaces = () => races;

export const GetRace = (racename?: string) => {
	return racename ? raceByName[racename.toLowerCase()] : undefined;
}

export const GetClass = (id?: string) => {
	return id ? classByName[id.toLowerCase()] : undefined;
}

export const RandRace = (racename?: string | null, userLevels: number = 0) => {

	const filtered = userLevels > 0 ? races.filter(v => v.minLevels <= userLevels) : races;

	if (racename) {
		racename = racename.toLowerCase();
		if (raceByName[racename] != null) return raceByName[racename];
	}
	return filtered[Math.floor(filtered.length * Math.random())];
}

export const RandClass = (id?: string | null, userLevels: number = 0) => {

	const filtered = userLevels > 0 ? classes.filter(v => v.minLevels <= userLevels) : classes;

	if (id) {
		id = id.toLowerCase();
		if (classByName.hasOwnProperty(id)) return classByName[id];
	}
	return filtered[Math.floor(filtered.length * Math.random())];

}

const ParseRace = (raw: RawRaceData) => {

	const race = new Race(raw.id, raw.hitdie, (raw as any).minLevels);

	race.desc = raw.desc;

	if (raw.create) {

		const base = raw.create;
		let k: keyof typeof base;
		for (k in base) {

			const v = ParseValue(k, base[k]);
			if (v) race.addCreateValue(k, v);
		}

	}
	const mods = raw.mod;
	if (mods) {
		let k: keyof typeof mods;
		for (k in mods) {
			const m = ParseMod(k, mods[k], 1);
			if (m) race.addCharMod(m);
		}

	}

	if (raw.talents) {
		race.talents.push(...raw.talents);
	}

	return race;
}

export const InitRaces = async () => {

	const raws = (await import('../data/races.json', { assert: { type: 'json' } })).default;

	for (let i = raws.length - 1; i >= 0; i--) {
		try {
			const race = ParseRace(raws[i]);

			raceByName[race.name] = race;
			races.push(race);

		} catch (e) {
			console.error(e);
		}
	}

}


export const InitClasses = async () => {

	const raw = (await import('../data/classes.json', { assert: { type: 'json' } })).default;

	for (let i = raw.length - 1; i >= 0; i--) {

		try {
			const cls = ParseRace(raw[i]);
			classByName[cls.name] = cls;
			classes.push(cls);

		} catch (e) {
			console.log(e);
		}

	}

}