import { EventEmitter } from 'eventemitter3';
import { TActor } from 'rpg/char/mobs';
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
import { IsSimple, IsValue, type Numeric, type TValue } from 'rpg/values/types';
import { Item, TStacker } from '../items/item';
import { Dot, ProtoDot } from '../magic/dots';
import { Coord } from '../world/coord';
import { Race, type GClass } from './race';
import { StatBlock, type StatMod } from './stats';

export class Actor {

	getStatus() { return `${this.hp.value}/${this.hp.max} [${this.state}]` }

	isAlive() { return !this.flags.has(StatusFlag.dead) }
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

	get evil() { return (this.teams.ranks[Team.evil] ?? 0) + (this.teams.ranks[Team.good] ?? 0); }

	// convenience for shorter formulas.
	get hp() { return this.stats.hp; }
	set hp(v) { this.stats.hp.value = v.valueOf(); }

	get mp() { return this.stats.mp; }
	set mp(v) { this.stats.mp.value = v.valueOf() }

	get dr() { return this.stats.dr; }
	set dr(v: Numeric) { this.stats.dr.value = v.valueOf() }

	get resist() { return this.resists }

	get level() { return this.stats.level; }
	set level(v) { this.stats.level.value = v.valueOf() }

	get gold() { return this.stats.gold; }
	set gold(g) { this.stats.gold = g < 0 ? 0 : g; }

	get age() { return this.stats.age; }
	set age(s) { this.stats.age.setTo(s); }

	get armor() { return this.stats.armor; }
	set armor(v: Numeric) { this.stats.armor.setTo(v) }

	get str() { return this.stats.str; }
	set str(v: Numeric) { this.stats.str.value = v.valueOf() }

	get con() { return this.stats.con; }
	set con(v: Numeric) {

		this.stats.con.setTo(v);
		this.computeHp();

	}

	get dex() { return this.stats.dex; }
	set dex(v: Numeric) { this.stats.dex.value = v.valueOf() }

	get int() { return this.stats.int; }
	set int(v: Numeric) { this.stats.int.value = v.valueOf() }
	get wis() { return this.stats.wis; }
	set wis(v: Numeric) { this.stats.wis.value = v.valueOf() }
	get cha() { return this.stats.cha; }
	set cha(v: Numeric) { this.stats.cha.value = v.valueOf() }

	get HD() {
		return this._myClass ?
			Math.floor((this._myClass.HD + this.race.HD) / 2) : this.race.HD;
	}

	get cls() { return this._myClass }

	get tohit() { return this.getModifier('dex'); }
	get at() { return this._at; }
	set at(v) { this._at.setTo(v); }

	readonly name: string;
	private readonly _at: Coord;
	race: Race;
	readonly stats: StatBlock = new StatBlock();
	readonly dots: Dot[] = [];
	private _myClass?: GClass;
	readonly talents: string[] = [];

	readonly resists: Record<string, Numeric> = {};

	height?: number;
	weight?: number;

	sex: SexType = 'm';

	guild?: string;

	get id() { return this.name }

	/**
	 * Current mods applied to char.
	 */
	readonly mods: ModBlock<typeof this>[] = [];

	readonly events = new EventEmitter<CharEvents>();
	readonly game: Game;

	readonly attacks: TNpcAction[] = [];

	flags: CharFlags = new CharFlags();

	readonly teams: Faction = new Faction(Team.chars);
	get team() { return this.teams.team }

	readonly minions: TActor[] = [];

	constructor(name: string, opts: {
		game: Game,
		race: Race, cls?: GClass,
		sex?: SexType
	}) {

		this.name = name;

		this.sex = opts.sex ?? (Math.random() < 0.5 ? 'm' : 'f');

		this.game = opts.game;

		this._myClass = opts.cls;

		this.race = opts.race;

		this._at = new Coord(0, 0);

	}

	/**
	 * Remove count of stackable item.
	 * @param which 
	 * @param n 
	 */
	removeN(which: Item & TStacker, n: number = 1): boolean | Item {
		return false;
	}

	public setBaseStats(stats: Record<keyof Extract<StatBlock, TValue>, Numeric>) {

		let k: keyof Extract<StatBlock, TValue>;
		for (k in stats) {

			if (!(k in this.stats)) {
				console.warn(`bad stat: ${k}`)
				continue;
			};

			const targ = this.stats[k as keyof StatBlock];
			if (IsSimple(targ)) {

				targ.setTo(stats[k]);

			} else if (IsValue(targ)) {
				targ.value = stats[k].valueOf();
			}
		}

	}

	getAttack() {
		return this.attacks[Math.floor(this.attacks.length * Math.random())] ?? Fists;
	}

	/// todo
	isImmune(type?: string): boolean {
		return false;
	}
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
				console.log(`mod: ${k.toString()}`);
				targ.addMod(m);
			} else {

			}

		}
		this.mods.push(mods);

	}

	/**
	 * @param stat
	 */
	getModifier(stat: string) { return this.stats.getModifier(stat); }


	statRoll(...stats: string[]) {
		let v = 1 + 4 * Math.random() * (this.stats.level.value);
		for (let s of stats) {
			v += this.stats.getModifier(s);
		}
		return v;

	}


	levelUp() {

		this.stats.level.add(1);

		const hpBonus = this.HD + this.stats.getModifier('con');
		this.stats.addMaxHp(hpBonus);

	}

	/**
	 * Add existing/created dot.
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

	addGold(amt: number) { this.stats.gold += amt; }

	revive() {

		if (this.hp.value <= 0) this.hp.value = 1;
		this.state = CharState.Alive;

	}

	updateState() {
		if (this.hp.value <= 0) {
			this.state = CharState.Dead;
		}
	}

	/*hit(amt: number) {
		this.hp.value -= amt;
		if (this.hp.value <= 0) {
			this.flags &= (~StatusFlags.alive);
		}
	}*/

	hasTalent(s: string) {
		return this.talents?.includes(s);
	}

	/// TODO
	addItem(it: Item | Item[]): number { return 0 }
	randItem(): Item | null { return null; }
	removeItem(which: number | string | Item, sub?: number | string): Item | null { return null; }

	/**
	 * Computes current, as opposed to base hp.
	*/
	private computeHp() {

		const hp =
			Math.max(1,
				this.stats.hp.max.value + this.stats.level.value * this.getModifier('con'));
		this.hp.max.value = hp;

	}

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

	applyBaseMods(mods?: StatMod) {
	}

} //cls