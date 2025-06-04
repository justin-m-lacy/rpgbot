import { Race } from '../char/race';

const races: Race[] = [];

const raceByName: { [race: string]: Race } = {};

export const GetRace = (racename?: string) => {
	return racename ? raceByName[racename.toLowerCase()] : undefined;
}

export const RandRace = (racename?: string) => {

	if (racename) {
		racename = racename.toLowerCase();
		if (raceByName[racename] != null) return raceByName[racename];
	}
	return races[Math.floor(races.length * Math.random())];
}

export const InitRaces = async () => {

	try {

		const raws = (await import('../data/races.json')).default;

		for (let i = raws.length - 1; i >= 0; i--) {

			const raw = raws[i];
			if (raw.baseStats) {

				for (const k in raw.baseStats) {

				}

			}

			const race = Race.Revive(raws[i]);
			raceByName[race.name] = race;
			races.push(race);

		}

	} catch (e) {
		console.error(e);
	}

}
