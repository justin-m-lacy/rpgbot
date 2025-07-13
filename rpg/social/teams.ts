
export enum Team {

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

type TeamName = keyof typeof Team;

/**
 * Starting Char team ranks.
 */
export const CharTeam = () => {
	return {
		[Team.chars]: 100,
		[Team.good]: 25,
		[Team.law]: 5,
		[Team.neutral]: 50,
		[Team.evil]: -30,
	}

}

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
				f |= (Team[parts[i] as TeamName] ?? 0);
			}
		}
	}
	if (data.kind) {
		f |= (Team[data.kind as TeamName] ?? 0);
	}
	// todo: remove evil keyword.
	if (data.evil) {
		if (data.evil >= 5) {
			f |= Team.evil;
		} else if (data.evil <= -5) {
			f |= Team.good;
		}
	}

	return f || Team.neutral;

}