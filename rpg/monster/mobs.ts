import { randomUUID } from 'crypto';
import { CharFlags, StatusFlag } from 'rpg/char/states';
import { TCombatAction } from 'rpg/combat/types';
import { Dot, ProtoDot } from 'rpg/magic/dots';
import { type MobData } from 'rpg/parsers/mobs';
import { Team } from 'rpg/social/teams';
import { quickSplice } from 'rpg/util/array';
import { IsInt } from 'rpg/util/parse';
import { Maxable } from 'rpg/values/maxable';
import { Coord, TCoord } from 'rpg/world/coord';
import { Actor } from '../char/actor';
import * as stats from '../char/stats';
import { Item, TStacker } from '../items/item';
import { roll } from '../values/dice';

export type TActor = Actor | Mob;

export class Mob {

	toJSON() {

		return {
			id: this.id,
			name: this.name,
			desc: this.desc,
			level: this.level,
			hp: this._hp,
			dots: this.dots.length > 0 ? this.dots : undefined,
			armor: this._armor,
			toHit: this._toHit,
			flags: this.flags,
			evil: this._evil ?? undefined,
			proto: this.proto?.id
			//weap: this.weap ?? undefined

		};

	}

	get drops() { return this.proto?.drops; }

	get toHit() { return this._toHit; }
	set toHit(v) { this._toHit = v; }

	get evil() { return this._evil; }
	set evil(v) { this._evil = v; }

	get kind() { return this.proto?.kind; }

	get armor() { return this._armor; }
	set armor(v) { this._armor = v; }

	// convenience for shorter formulas.
	get hp() { return this._hp; }
	set hp(v) { this._hp.value = v.valueOf(); }

	get biome() { return this.proto?.biome }
	get desc() { return this.proto?.desc ?? '' }

	isAlive() { return this.flags.has(StatusFlag.alive) }

	readonly flags: CharFlags = new CharFlags();

	private _toHit: number;

	name: string = 'unknown';

	private readonly _hp: Maxable = new Maxable('hp');

	readonly id: string;

	level: number = 0;
	private _armor: number = 0;
	private _evil: number = 0;
	size: string;
	readonly proto?: MobData;
	readonly attacks: TCombatAction[] = [];
	private _talents?: string[];

	team: number = 0;

	private _held?: Item[];

	// location of coordinate.
	at: TCoord = new Coord(0, 0);

	readonly dots: Dot[] = [];

	/**
	 * ids of actors that have interacted with mob.
	 */
	actors?: Record<string, number>;

	constructor(id?: string, proto?: MobData | undefined) {

		this.id = id ?? randomUUID();
		this._toHit = 0;
		this.proto = proto;

		this.flags.setTo((proto?.flags || StatusFlag.alive));
		this.size = proto?.size ?? 'medium';

		this.team = proto?.team ?? Team.neutral;

	}

	isImmune(type?: string) { return false }

	getResist(type?: string): number {
		return 0;
	}

	/// TActor interface
	log(s: string) {
		console.log(`Mob PM: ${s}`);
	}

	statRoll(...stats: string[]) {
		/// TODO
		return roll(1, 5 * (this.level + 4));
	}

	hasTalent(s: string) {
		return this._talents?.includes(s);
	}

	addDot(e: Dot | ProtoDot, maker?: string) {
		if (e instanceof ProtoDot) e = new Dot(e, maker);

		this.dots.push(e);
		e.start(this);

	}

	/**
	 * Get this mob's standing with a team.
	 * todo: doesn't allow for neutral standings.
	 * @param team 
	 */
	standing(team: Team) {
		return (this.team & team) > 0 ? this.level : 0;
	}

	getAttack() {
		return this.attacks[Math.floor(this.attacks.length * Math.random())];
	}

	rmDot(e: Dot | ProtoDot) {
		const ind = this.dots.findIndex(v => v.id === e.id);
		if (ind >= 0) {

			this.dots[ind].end(this);
			quickSplice(this.dots, ind);

		}
	}

	addItem(it: Item) {

		if (!this._held) this._held = [];
		this._held.push(it);
	}

	randItem() {
		if (this._held?.length) {
			return this.removeItem(Math.floor(Math.random() * this._held.length));
		}
		return null;
	}
	removeItem(which: number | string | Item): Item | null {

		if (!this._held) return null;

		if (typeof which === 'string') {

			if (!IsInt(which)) {

				which = which.toLowerCase();
				which = this._held.findIndex(v => v.name == which);

			} else which = Number.parseInt(which);

		} else if (typeof which === 'object') {
			which = this._held.indexOf(which);
		}

		if (which >= this._held.length || which < 0) {
			return null;
		}
		return this._held.splice(which)[0];

	}

	/**
 * Remove count of stackable item.
 * @param which 
 * @param n 
 */
	removeN(which: Item & TStacker, n: number = 1) {
		return false;
	}

	getDetails() {

		return `level ${this.level.valueOf()} ${this.name} [${stats.getEvil(this._evil)}${this.kind ?? ''}] \nhp:${Math.ceil(this._hp.valueOf())}/${Math.ceil(this._hp.max.valueOf())} armor:${Math.ceil(this._armor)}\n${this.desc}`;

	}

	// combat & future compatibility.
	getModifier(stat: string) { return 0; }
	addExp(exp: number) { }
	updateState() {
		if (this._hp.value <= 0) {
			this.flags.unset(StatusFlag.alive);
		}
	}
	// used in combat

	/*hit(dmg: number, type?: string) {

		this._hp.add(-dmg);
		if (this._hp.value <= 0) {
			this.flags.unset(~StatusFlag.alive);
			return true;
		}
		return false;

	}*/

}