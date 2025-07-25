import { DecodeItem } from 'rpg/parsers/items';
import { ICache } from 'rpg/util/icache';
import { Char } from '../char/char';
import { Inventory } from '../inventory';
import { Coord } from '../world/coord';
import { SocialGroup } from './social-group';


/**
 * Can't use statics because static variables from
 * different servers are shared.
 */
export class GuildManager {

	readonly cache: ICache<Guild>;
	readonly chars: ICache<Char>;

	constructor(cache: ICache<Guild>, chars: ICache<Char>) {
		this.cache = cache;
		this.chars = chars;
	}

	/**
	 *
	 * @param name
	 * @returns
	 */
	async GetGuild(name: string) {

		let data = this.cache.get(name) as Guild | undefined;
		if (data) return data;

		data = await this.cache.fetch(name);
		if (!data) return data;

		data = Guild.Decode(data, this.chars);
		this.cache.cache(name, data);

		return data;

	}

	/**
	 *
	 * @returns
	 */
	async MakeGuild(name: string, leader: Char) {

		const g = new Guild(name, this.chars);
		g.leader = leader.name;
		g.roster.push(leader.name);
		g.createdAt = Date.now();

		await this.cache.store(name, g);
		return g;

	}

}

export class Guild extends SocialGroup {

	static Decode(json: any, cache: ICache<Char>) {

		const g = new Guild(json.name, cache);

		Object.assign(g, json);

		if (g.inv) g.inv = Inventory.Decode(g.inv, DecodeItem, g.inv);
		else g.inv = new Inventory();

		return g;

	}

	toJSON() {

		return {

			name: this.name,
			leader: this.leader,
			desc: this.desc,
			roster: this.roster,
			invites: this.invites,
			inv: this.inv,
			level: this._level,
			loc: this.loc,
			created: this.createdAt,
			exp: this._exp

		};

	}

	get inv() { return this._inv; }
	set inv(v) { this._inv = v; }

	get level() { return this._level; }
	set level(v) { this._level = v; }

	get exp() { return this._exp; }
	set exp(v) { this._exp = v; }

	private _level: number = 1;
	private _exp: number = 0;

	createdAt: number = 0;
	desc?: string;

	private _inv?: Inventory;
	readonly loc: Coord = new Coord(0, 0);

	constructor(name: string, cache: ICache<Char>) {

		super(cache);

		this.name = name;

	}

}