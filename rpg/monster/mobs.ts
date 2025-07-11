import { randomUUID } from 'crypto';
import { Faction } from 'rpg/char/factions';
import { StatusFlags } from 'rpg/char/states';
import { TCombatAction } from 'rpg/combat/types';
import { Dot, ProtoDot } from 'rpg/magic/dots';
import { type MobData } from 'rpg/parsers/mobs';
import { quickSplice } from 'rpg/util/array';
import { IsInt } from 'rpg/util/parse';
import { Maxable } from 'rpg/values/maxable';
import { Actor } from '../char/actor';
import * as stats from '../char/stats';
import { Item } from '../items/item';
import { roll } from '../values/dice';
import { Coord } from '../world/coord';

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

	isAlive() { return (this.flags & StatusFlags.alive) > 0 }

	flags: StatusFlags;

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
	readonly at: Coord = new Coord(0, 0);
	readonly dots: Dot[] = [];

	constructor(id?: string, proto?: MobData) {

		this.id = id ?? randomUUID();
		this._toHit = 0;
		this.proto = proto;

		this.flags = (proto?.flags ?? StatusFlags.none) | StatusFlags.alive;
		this.size = proto?.size ?? 'medium';
		this.team = proto?.team ?? Faction.All;

	}

	isImmune(type?: string) { return false }

	getResist(type?: string): number {
		return 0;
	}

	setLoc(at: Coord) {
		this.at.setTo(at);
	}

	send(s: string) {
		console.log(`mob send: ${s}`);
	}

	/**
	 * Compatibility for logging.
	 * @param s 
	 */
	log(s: string) {
		console.log(`MOB: ${s}`)
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
			return this.takeItem(Math.floor(Math.random() * this._held.length));
		}
		return null;
	}
	takeItem(which: number | string | Item): Item | null {

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

	getDetails() {

		return `level ${this.level} ${this.name} [${stats.getEvil(this._evil)}${this.kind ?? ''}] \nhp:${this._hp}/${this._hp.max} armor:${this._armor}\n${this.desc}`;

	}

	// combat & future compatibility.
	getModifier(stat: string) { return 0; }
	addExp(exp: number) { }
	updateState() {
		if (this._hp.value <= 0) {
			this.flags &= (~StatusFlags.alive);
		}
	}
	// used in combat

	hit(dmg: number, type?: string) {

		this._hp.add(-dmg);
		if (this._hp.value <= 0) {
			this.flags &= (~StatusFlags.alive);
			return true;
		}
		return false;

	}

}