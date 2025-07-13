
export enum Faction {

	none = 0,
	// player chars
	chars = 1,
	good = 2,
	evil = 4,
	neutral = 8,
	/// wild animals
	beast = 16,
	undead = 32,
	human = 64,
	orc = 128,
	goblin = 256
}

type TeamName = keyof typeof Faction;

export const ParseFaction = (data: { team?: string, kind?: string, evil?: number }) => {

	let f = Faction.neutral;
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

	return f;

}