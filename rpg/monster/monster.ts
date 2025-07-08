import { randomUUID } from 'crypto';
import { Faction } from 'rpg/char/factions';
import { StatusFlags } from 'rpg/char/states';
import { Dot, ProtoDot } from 'rpg/magic/dots';
import { GetMonster, MobData } from 'rpg/parsers/monster';
import { quickSplice } from 'rpg/util/array';
import { IsInt } from 'rpg/util/parse';
import { Maxable } from 'rpg/values/maxable';
import { Numeric } from 'rpg/values/types';
import { Actor, CharState } from '../char/actor';
import * as stats from '../char/stats';
import { Item } from '../items/item';
import { Weapon } from '../items/weapon';
import { roll } from '../values/dice';
import { Biome, Coord, IsCoord } from '../world/loc';

export type TActor = Actor | Mob;

export class Mob {

	static Decode(json: any) {

		const m = new Mob(json.id, GetMonster(json.proto));

		if (json.name) m.name = json.name;

		if (json.hp) {
			m.hp.setTo(json.hp);
		}
		if (IsCoord(json.at)) {
			m.at.setTo(json.at);
		}

		const desc = Object.getOwnPropertyDescriptors(m);
		for (const k in json) {

			if (!desc[k] || desc[k].writable) {
				desc[k] = json[k];
			} else {
				console.log(`no write: ${k}`);
			}

		}

		if (m.weap) m.weap = Weapon.Decode(m.weap);
		if (m.toHit) m.toHit = Number(m.toHit);
		return m;

	}

	toJSON() {

		return {
			id: this.id,
			name: this.name,
			desc: this.desc,
			level: this.level,
			hp: this._hp.toJSON(),
			curHp: this._hp,
			dots: this.dots.length > 0 ? this.dots : undefined,
			armor: this._armor,
			toHit: this._toHit,
			state: this._state != CharState.Alive ? this._state : undefined,
			drops: this._drops ?? undefined,
			evil: this._evil ?? undefined,
			kind: this._kind ?? undefined,
			dmg: this.dmg ?? undefined,
			weap: this._weap ?? undefined

		};

	}

	get drops() { return this._drops; }
	set drops(v) { this._drops = v; }

	get toHit() { return this._toHit; }
	set toHit(v) { this._toHit = v; }

	get evil() { return this._evil; }
	set evil(v) { this._evil = v; }

	get kind() { return this._kind; }
	set kind(v) { this._kind = v; }

	get armor() { return this._armor; }
	set armor(v) { this._armor = v; }

	get hp() { return this._hp }

	get weap() { return this._weap; }
	set weap(v) { this._weap = v; }

	get state() { return this._state; }
	set state(v) { this._state = v; }

	isAlive() { return this._state !== CharState.Dead; }

	flags: StatusFlags;

	biome?: Biome;

	private _toHit: number;
	private _state: CharState;
	private _kind?: string;

	name: string = 'unknown';
	desc?: string;

	private readonly _hp: Maxable = new Maxable('hp');

	readonly id: string;

	level: number = 0;
	private _armor: number = 0;
	private _evil: number = 0;
	size: string;
	private _drops?: any;
	readonly proto?: MobData;
	private dmg?: Numeric;
	private _weap?: any;
	private _attacks: any;
	private _talents?: string[];

	team: number = 0;

	private _held?: Item[];

	// location of coordinate.
	readonly at: Coord = new Coord(0, 0);
	readonly dots: Dot[] = [];

	constructor(id?: string, proto?: MobData) {
		this.id = id ?? randomUUID();
		this._toHit = 0;
		this._state = CharState.Alive;
		this.proto = proto;

		this.flags = proto?.flags ?? StatusFlags.none;
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

	/**
	 * Compatibility for logging.
	 * @param str 
	 */
	log(str: string) { console.log(`MOB: ${str}`) }

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
	takeItem(which: number | string | Item) {

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

		const kind = this._kind ? ` ${this._kind}` : '';
		return `level ${this.level} ${this.name} [${stats.getEvil(this._evil)}${kind}]\nhp:${this._hp}/${this._hp.max} armor:${this._armor}\n${this.desc}`;

	}

	// combat & future compatibility.
	getModifier(stat: string) { return 0; }
	addExp(exp: number) { }
	updateState() { if (this._hp.value <= 0) this._state = CharState.Dead; }
	// used in combat
	getState() { return this._state; }

	getWeapons() { return this._weap; }
	getAttacks() { return this._attacks; }

	hit(dmg: number, type?: string) {

		this._hp.add(-dmg);
		if (this._hp.value <= 0) {
			this._state = CharState.Dead;
			return true;
		}
		return false;

	}

}