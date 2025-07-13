
export enum Faction {

	none = 0,
	// player chars
	chars = 1,
	good = 2,
	evil = 4,
	neutral = 8,
	law = 16,
	chaos = 32,
	/// wild animals
	beast = 64,
	undead = 128,
	human = 256,
	orc = 512,
	goblin = 1024
}

type TeamName = keyof typeof Faction;

/**
 * Calculate an npc's default faction.
 * @param data 
 * @returns 
 */
export const CalcFaction = (data: { team?: string, kind?: string, evil?: number }) => {

	let f = 0;

	if (data.team) {
		if (typeof data.team === 'number') {
			f |= data.team;
		} else {
			const parts = data.team.split(',');
			for (let i = 0; i < parts.length; i++) {
				f |= (Faction[parts[i] as TeamName] ?? 0);
			}
		}
	}
	if (data.kind) {
		f |= (Faction[data.kind as TeamName] ?? 0);
	}
	// todo: remove evil keyword.
	if (data.evil) {
		if (data.evil >= 5) {
			f |= Faction.evil;
		} else if (data.evil <= -5) {
			f |= Faction.good;
		}
	}

	return f || Faction.neutral;

}