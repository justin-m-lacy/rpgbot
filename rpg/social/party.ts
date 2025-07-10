import Cache from 'archcache';
import { Coord } from 'rpg/world/coord';
import { World } from 'rpg/world/world';
import { Char } from '../char/char';
import { Loc } from '../world/loc';
import { SocialGroup } from './social-group';

export class Party extends SocialGroup {

	static Decode(json: any, cache: Cache) {

		let p = new Party(json.leader, cache);

		Object.assign(p, json);

		return p;

	}

	toJSON() {

		return {
			roster: this.roster,
			leader: this.leader,
			invites: this.invites
		}

	}

	readonly at: Coord;

	constructor(leader: Char, cache: Cache) {

		super(cache);

		this.roster.push(leader.id);

		this.leader = leader.name;
		this.name = this.leader + "'s Party";

		this.at = new Coord(leader.at.x, leader.at.y);

	}

	async getState() {

		for (let i = this.roster.length - 1; i >= 0; i--) {

			const char = await this.cache.fetch(this.roster[i]);
			if (char?.isAlive()) return 'alive';

		} //
		return 'dead';

	}

	/**
	 *
	 * @param name
	 */
	async getChar(name: string) { return this.cache.fetch(name) as Promise<Char | undefined>; }

	async move(world: World, to: Loc) {

		const prev = await world.getLoc(this.at);

		this.at.setTo(to.coord);

		let roster = this.roster;

		for (let i = roster.length - 1; i >= 0; i--) {

			const char = await this.cache.fetch(roster[i]);
			if (char) {
				prev?.rmChar(char);
				to.addChar(char);
				char.at.setTo(to.coord);
				char.recover();
			}

		} //

	}

	async rest() {

		const roster = this.roster;

		let hp = 0;
		let max = 0;

		for (let i = roster.length - 1; i >= 0; i--) {

			const char = await this.cache.fetch(roster[i]);
			if (!char) continue;
			if (char.isAlive()) char.rest();
			hp += char.hp.value;
			max += char.hp.max.value;

		} //

		return hp / max;
	}

	async recover() {

		const roster = this.roster;

		for (let i = roster.length - 1; i >= 0; i--) {

			const char = await this.cache.fetch(roster[i]);
			//console.log( 'moving char: ' + char.name + ' to: ' + coord.toString() );
			char?.recover();

		} //

	}

	async getStatus() {

		let res = this.name + ':';

		const roster = this.roster;
		const len = roster.length;

		for (let i = 0; i < len; i++) {
			const char = await this.cache.fetch(roster[i]);
			if (char) {
				res += `\n${char.name}  ${char.getStatus()}`;
			}
		}

		return res;

	}

	async addExp(exp: number) {

		const len = this.roster.length;

		// add exp bonus for party members.
		exp = Math.floor(exp * (1 + len * 0.15) / len);

		for (let i = len - 1; i >= 0; i--) {

			const c = await this.cache.fetch(this.roster[i]);
			if (c) c.addExp(exp)

		}

	}

	/**
	 * Returns a random alive character from a group.
	 */
	async randAlive() {

		const len = this.roster.length;
		let ind = Math.floor(Math.random() * len);
		const start = ind;

		do {

			const c = await this.cache.fetch(this.roster[ind]);
			if (c?.isAlive()) return c;

			if (++ind >= len) ind = 0;

		} while (ind != start);

		return null;

	}


	/**
	 * A valid target must be alive and have positive hitpoints.
	 */
	async randTarget() {

		const len = this.roster.length;
		let ind = Math.floor(Math.random() * len);
		const start = ind;

		do {

			const c = await this.cache.fetch(this.roster[ind]);

			if (c?.isAlive()) return c;
			if (++ind >= len) ind = 0;

		} while (ind != start);

		return null;

	}

}