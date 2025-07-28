import { EventEmitter } from 'eventemitter3';
import { TActor } from 'rpg/char/mobs';
import { Stat } from 'rpg/char/stat.js';
import { CharFlags, CharState, StatusFlag } from 'rpg/char/states';
import { TNpcAction } from 'rpg/combat/types';
import { CharEvents } from 'rpg/events';
import { Game } from 'rpg/game';
import { Fists } from 'rpg/items/weapon';
import { Faction } from 'rpg/social/faction';
import type { SexType } from 'rpg/social/gender';
import { Team } from 'rpg/social/teams';
import { quickSplice } from 'rpg/util/array';
import { CanMod, type ModBlock } from 'rpg/values/imod';
import { Maxable } from 'rpg/values/maxable.js';
import { Simple } from 'rpg/values/simple.js';
import { type Numeric } from 'rpg/values/types';
import { Dot, ProtoDot } from '../effects/dots.js';
import { Item, TStacker } from '../items/item';
import { Coord } from '../world/coord';
import { Race, type GClass } from './race';
import { StatDefs } from './stat';

export class Actor {

	getStatus() { return `${this.hp.value}/${this.hp.max} [${this.state}]` }

	isAlive() { return !this.flags.has(StatusFlag.dead) }

	toJSON() {

		const data: Record<string, any> = {
			hp: this.hp,
			mp: this.mp,
			dr: this.dr,
			level: this.level,
			age: this.age,

			name: this.name,
			teams: this.teams,
			race: this.race?.id,
			cls: this.gclass?.id,
			sex: this.sex,
			minions: this.minions.length ? this.minions : undefined,
			flags: this.flags,
			at: this.at,
			dots: this.dots,
			talents: this.talents
		}

		for (const k in this.stats) {
			data[k] = this.stats[k];
		}

		return data;

	}

	/**
	 * messy text-based state. flags makes it harder to test for blockers.
	 * in theory could have states that set multiple flags, as well as
	 * other mods.
	 * also: action uses set-state=alive to revive.
	 */
	get state() { return this.flags.has(StatusFlag.dead) ? CharState.Dead : CharState.Alive; }
	set state(v) {
		if (v === CharState.Dead) {
			this.flags.set(StatusFlag.dead);
		} else {
			this.flags.unset(StatusFlag.dead);
		}
	}

	readonly stats: Partial<Record<string, Stat>> = Object.create(null);

	get evil() { return (this.teams.ranks[Team.evil] ?? 0) + (this.teams.ranks[Team.good] ?? 0); }

	readonly _hp = new Maxable('hp');
	readonly _mp = new Maxable('mp');

	// convenience for shorter formulas.
	get hp() { return this._hp; }
	set hp(v) { this._hp.value = v.valueOf(); }

	get mp() { return this._mp; }
	set mp(v) { this._mp.value = v.valueOf() }

	readonly level: Simple = new Simple('level');
	readonly armor: Simple = new Simple('armor');
	readonly age: Simple = new Simple('age');

	// damage reduction.
	readonly dr: Simple = new Simple('dr');

	get resist() { return this.resists }

	_gold: number = 0;

	get gold() { return this._gold; }
	set gold(g) { this._gold = g < 0 ? 0 : g; }


	get con() { return this.stats.con!; }
	set con(v: Numeric) {

		this.stats.con?.setTo(v);
		//this.computeHp();

	}

	get HD() {
		return this.gclass ?
			Math.floor((this.gclass.HD + this.race.HD) / 2) : this.race.HD;
	}

	gclass?: GClass;
	race: Race;

	get tohit() { return this.getModifier('dex'); }
	get at() { return this._at; }
	set at(v) { this._at.setTo(v); }

	readonly name: string;
	private readonly _at: Coord;

	readonly dots: Dot[] = [];

	readonly talents: string[] = [];

	readonly resists: Record<string, Numeric> = {};

	sex: SexType = 'm';

	get id() { return this.name }

	/// Mods applied to char.
	readonly mods: ModBlock<typeof this>[] = [];

	readonly events = new EventEmitter<CharEvents>();

	readonly attacks: TNpcAction[] = [];

	flags: CharFlags = new CharFlags();

	readonly teams: Faction = new Faction(Team.chars);
	get team() { return this.teams.teamFlag }
	get enemies() { return this.teams.enemyFlag }

	readonly minions: TActor[] = [];

	constructor(name: string, opts: {
		game: Game,
		race: Race, cls?: GClass,
		sex?: SexType
	}) {

		this.name = name;

		this.sex = opts.sex ?? (Math.random() < 0.5 ? 'm' : 'f');

		this.gclass = opts.cls;

		this.race = opts.race;

		this._at = new Coord(0, 0);

		for (const k in StatDefs) {
			this.stats[k] = new Stat(StatDefs[k]);
		}

	}

	/**
	 * Remove count of stackable item.
	 * @param which 
	 * @param n 
	 */
	removeN(which: Item & TStacker, n: number = 1): boolean | Item {
		return false;
	}

	getAttack() {
		return this.attacks[Math.floor(this.attacks.length * Math.random())] ?? Fists;
	}

	/// todo
	isImmune(type?: string): boolean { return false; }

	getResist(type?: string): number {
		return this.resists[type ?? '']?.valueOf() ?? 0;
	}

	applyMods(mods: ModBlock<typeof this>) {

		let k: keyof typeof mods;
		for (k in mods) {
			const m = mods[k];
			if (m == null) continue;

			const targ = this[k];
			if (CanMod(targ)) {
				console.log(`${targ.id}: ${targ.value}`);
				targ.addMod(m);
				console.log(`Mod: ${targ.id}: ${targ.value}`);
			} else {

			}

		}
		this.mods.push(mods);

	}

	/**
	 * Get modifier for stat.
	 * @param stat 
	 */
	getModifier(stat: string): number {
		return ((this.stats[stat]?.value ?? 10) - 10) / 2;
	}


	statRoll(...stats: string[]) {
		let v = 1 + 4 * Math.random() * (this.level.value);
		for (let s of stats) {
			v += this.getModifier(s);
		}
		return v;

	}


	levelUp() {

		this.level.add(1);

		const hpBonus = this.HD;
		this.addMaxHp(hpBonus);

	}


	addMaxHp(amt: number) {
		this.hp.max.add(amt);
		this.hp.value += amt;
	}

	/**
	 * Computes current, as opposed to base hp.
	*/
	private computeHp() {

		const hp =
			Math.max(1,
				this.hp.max.value + this.level.value * this.getModifier('con'));
		this.hp.max.value = hp;

	}

	/**
	 * Add existing/create dot.
	 * @param e 
	 */
	addDot(e: Dot | ProtoDot, maker?: string) {

		if (e instanceof ProtoDot) e = new Dot(e, maker);

		this.dots.push(e);
		e.start(this);

		this.events.emit('dotStart', this, e);
	}

	rmDot(e: Dot | ProtoDot) {

		const ind = this.dots.findIndex(v => v.id === e.id);
		if (ind >= 0) {

			this.dots[ind].end(this);
			quickSplice(this.dots, ind);

		}

	}

	log(s: string) { console.log(s); }

	addGold(amt: number) { this.gold += amt; }

	revive() {

		if (this.hp.value <= 0) this.hp.value = 1;
		this.state = CharState.Alive;

	}

	updateState() {
		if (this.hp.value <= 0) {
			this.state = CharState.Dead;
		}
	}

	hasTalent(s: string) {
		return this.talents?.includes(s);
	}

	/// TODO
	addItem(it: Item | Item[]): number { return 0 }
	randItem(): Item | null { return null; }
	removeItem(which: number | string | Item, sub?: number | string): Item | null { return null; }

	heal(amt: number) {
		const prev = this.hp.value;
		this.hp.value += amt;
		return (this.hp.value - prev);
	}

	// recover hp without rest.
	rest(scale: number = 1) {

		if (!this.isAlive()) return 0;

		const amt = Math.max(1, Math.ceil(
			Math.random() * this.getModifier('con') +
			Math.random() * this.getModifier('wis') +
			this.level.valueOf()) / 2)
		return this.heal(scale * amt);
	}

}