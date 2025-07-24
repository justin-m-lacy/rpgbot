import { Team } from "rpg/social/teams";
import { ReverseMap } from "rpg/util/enums";

export class Faction {

	toJSON() {
		return ReverseMap(Team, this.ranks)
	}
	decode(data: ReturnType<typeof this.toJSON>) {

		for (let k in data) {
			if (k in Team) {
				// map string -> bit enum.
				this.ranks[(Team[k]) as any as Team] = data[k];
			}
		}
		this.recalc();

		return this;

	}

	readonly flag: Team;

	/**
	 * Standings with every other faction.
	 */
	readonly ranks: Partial<Record<Team, number>> = {}

	/// calculated anti teams.
	private anti: Team = 0;

	// calculated team from standings bits.
	private ally: Team = 0;
	get teamFlag() { return this.ally; }
	get enemyFlag() { return this.anti };

	constructor(flag: Team) {
		this.flag = flag;
	}

	setRanks(ranks: Partial<Record<Team, number>>) {
		for (const k in ranks) {
			this.ranks[k as any as Team] = ranks[k as any as Team];
		}
		this.recalc();
	}

	/**
	 * Recompute allies and antis based on standings.
	 */
	private recalc() {

		let anti = 0, ally = 0;

		for (let k in this.ranks) {
			if ((this.ranks[k as any as Team] ?? 0) >= 5) {
				ally |= k as any as Team;
			} else if ((this.ranks[k as any as Team] ?? 0) <= -5) {
				anti |= k as any as Team;
			}
		}
		this.ally = ally | this.flag;
		this.anti = anti;

	}

	/**
	 * Update standings with all teams in record.
	 * @param teams 
	 * @param scale 
	 */
	addRanks(teams: Partial<Record<Team, number>>, scale: number) {

		let ally = 0, anti = 0;

		for (let k in teams) {

			const t = this.ranks[k as any as Team] = (this.ranks[k as any as Team] ?? 0) +
				scale * (teams[k as any as Team] ?? 0);

			if (this.ranks[k as any as Team]! >= 5) ally |= (k as any as Team);
			else if (this.ranks[k as any as Team]! <= 5) anti |= k as any as Team;

		}
		this.ally = ally | this.flag;
		this.anti = anti;

	}

	/**
	 * Update char's standing with team.
	 * @param from 
	 * @param amt 
	 */
	addRank(from: Team, amt: number) {

		/// force to unsigned javascript.
		from = from >>> 0;

		let antis = 0, ally = 0;
		let f: Team = 1;


		while (f <= from) {

			if (from & f) {
				this.ranks[f] = (this.ranks[f] ?? 0) + amt;
				if (this.ranks[f]! >= 5) {
					ally |= f;
				} else if (this.ranks[f]! <= -5) {
					antis |= f;
				}

			}
			f = (f << 1) >>> 0;
		}

		this.ally = ally | this.flag;
		this.anti = antis;
	}

}