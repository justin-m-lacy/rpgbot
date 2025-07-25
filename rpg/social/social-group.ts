import { ICache } from 'rpg/util/icache';
import { Char } from '../char/char';
/**
 * Any named group of players.
 * (Parties, Guilds, CombatGroups? etc)
 */
export class SocialGroup {

	/**
	 * @property leader - group leader.
	 */
	get leader() { return this._leader; }
	set leader(v) { this._leader = v; }

	/**
	 * @property {string} name - Name of group.
	 */
	name?: string;

	/**
	 * @property invites - Active invites to join the group.
	 */
	readonly invites: string[] = [];

	/**
	 * @property roster - Names of characters in the group.
	 */
	readonly roster: string[] = [];

	private _leader: string = '';

	readonly cache: ICache<Char>;

	constructor(cache: ICache<Char>) {

		this.cache = cache;
	}

	/**
	 * Invite character to group.
	 * @param char
	 */
	invite(char: Char | string) {

		const name = typeof char === 'string' ? char : char.name;

		if (this.invites.includes(name) || this.roster.includes(name)) return;
		this.invites.push(name);

	}

	/**
	 * Accept character in group. Character was confirmed.
	 * @param char
	 * @returns
	 */
	acceptInvite(char: Char) {

		const name = char.name;

		// prevent double join errors, but return success.
		if (this.roster.includes(name)) return true;

		const ind = this.invites.indexOf(name);
		if (ind >= 0) {

			this.invites.splice(ind, 1);
			this.roster.push(name);

			return true;

		} else return false;

	}

	async randChar() {
		const char = await this.cache.fetch(
			this.roster[Math.floor(this.roster.length * Math.random())]
		);
		return char as Char | undefined;
	}

	/**
	 *
	 * @param name
	 * @returns true if the party should be removed. false otherwise.
	 */
	leave(char: Char) {

		const name = char.name;
		const ind = this.roster.indexOf(name);
		if (ind >= 0) {

			this.roster.splice(ind, 1);
			if (this.roster.length === 0 ||
				(this.roster.length === 1 && this.invites.length === 0)) return true;

			if (this._leader === name) this._leader = this.roster[0];

		}
		return false;
	}

	/**
	 *
	 * @param char
	 */
	includes(char: Char | string) {
		return this.roster.includes(typeof char === 'string' ? char : char.name);
	}

	isLeader(char: Char | string) { return this._leader === (typeof char === 'string' ? char : char.name); }

	setLeader(char: Char | string) {

		const name = (typeof (char) === 'string') ? char : char.name;
		if (!this.roster.includes(name)) return false

		this.leader = name;
		return true;

	}

	getList() {
		return this.name + ":\n" + this.roster.join('\n');
	}

}