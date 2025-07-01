import EventEmitter from 'eventemitter3';
import type { CharEvents } from 'rpg/char/events';
import type { SexType } from 'rpg/social/gender';
import { CanMod, type ModBlock } from 'rpg/values/imod';
import { IsSimple, IsValue, type Numeric, type TValue } from 'rpg/values/types';
import { Item } from '../items/item';
import { Weapon } from '../items/weapon';
import { Effect, ProtoEffect } from '../magic/effects';
import { roll } from '../values/dice';
import { Coord } from '../world/loc';
import { Race, type GClass } from './race';
import { StatBlock, type StatMod } from './stats';

enum CharState {
	Dead = 'dead',
	Alive = 'alive'
}
export type LifeState = 'alive' | 'dead';


export class Actor {

	// used to abstract await state in combat.
	getState() { return this._state; }

	getStatus() { return `${this.hp.value}/${this.hp.max} [${this._state}]` }

	get state() { return this._state; }
	set state(v) { this._state = v; }
	isAlive() { return this._state !== CharState.Dead; }

	get evil() { return this.stats.evil; }
	set evil(v: Numeric) { this.stats.evil.setTo(+v); }

	// convenience for shorter formulas.
	get hp() { return this.stats.hp; }
	set hp(v) { this.stats.hp.value = v.valueOf(); }

	get dr() { return this.stats.dr; }
	set dr(v: Numeric) { this.stats.dr.value = v.valueOf() }

	get resist() { return this.resists }

	// convenience for shorter formulas.
	get mp() { return this.stats.mp; }
	set mp(v) { this.stats.mp.value = v.valueOf() }

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

	get toHit() { return this.getModifier('dex'); }
	get loc() { return this._loc; }
	set loc(v) { this._loc.setTo(v); }

	readonly name: string;
	private readonly _loc: Coord;
	race: Race;
	readonly stats: StatBlock = new StatBlock();
	readonly effects: Effect[] = [];
	private _myClass?: GClass;
	readonly talents: string[] = [];

	readonly resists: Record<string, Numeric> = {};

	height?: number;
	weight?: number;

	sex: SexType = 'm';

	guild?: string;

	/**
	 * Current mods applied to char.
	 */
	readonly mods: ModBlock<typeof this>[] = [];
	private _state: CharState;

	readonly events: EventEmitter<CharEvents> = new EventEmitter();

	constructor(name: string, race: Race, rpgClass?: GClass) {

		this.name = name;

		this._myClass = rpgClass;

		this.race = race;

		this._loc = new Coord(0, 0);

		this._state = CharState.Alive;

	}

	public setBaseStats(stats: Record<keyof Extract<StatBlock, TValue>, Numeric>) {

		let k: keyof Extract<StatBlock, TValue>;
		for (k in stats) {

			if (!(k in this)) {
				console.warn(`unknown stat: ${k}`)
				continue;
			};

			const targ = this[k as keyof this];
			if (IsSimple(targ)) {
				targ.setTo(stats[k].valueOf());

			} else if (IsValue(targ)) {
				targ.value = stats[k].valueOf();
			}
		}

	}

	setMods(mods: ModBlock<typeof this>) {

		this.applyMods(mods);
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
	 * Removes a gold amount or returns false.
	 * @param amt
	 */
	payOrFail(amt: number) {

		if (amt > this.gold) return false;
		this.gold -= amt;
		return true;

	}

	statRoll(...stats: string[]) {
		let roll = this.skillRoll();
		for (let s of stats) {
			roll += this.getModifier(s);
		}
		return roll;

	}
	skillRoll() { return roll(1, 5 * (this.stats.level.value + 4)); }

	levelUp() {

		this.stats.level.add(1);

		const hpBonus = this.HD + this.stats.getModifier('con');
		this.stats.addMaxHp(hpBonus);

	}

	addEffect(e: Effect | ProtoEffect) {

		if (e instanceof ProtoEffect) {
			e = new Effect(e);
		}
		this.effects.push(e);
		e.start(this);
		this.events.emit('effectStart', this, e);

	}

	rmEffect(e: Effect | ProtoEffect) { }

	addGold(amt: number) { this.stats.gold += amt; }

	/**
	 * @param stat
	 */
	getModifier(stat: string) { return this.stats.getModifier(stat); }

	revive() {

		if (this.hp.value <= 0) this.hp.value = 1;
		this.state = CharState.Alive;

	}

	getWeapons(): Weapon | Weapon[] | null { return null; }

	updateState() {
		if (this.hp.value <= 0) this.state = CharState.Dead;
		else this.state = CharState.Alive;
		return this.state;
	}

	/**
	 * TODO: temp
	 */
	hit(amt: number) {
		this.hp.value -= amt;
		if (this.hp.value <= 0) {
			return this.state = CharState.Dead;
		}
	}

	hasTalent(s: string) {
		return this.talents?.includes(s);
	}

	/// TODO
	addItem(it: Item) { }
	randItem() { null; }
	takeItem(which: number | string | Item, sub?: number | string): any { return null; }

	/**
	 * Computes current, as opposed to base hp.
	*/
	computeHp() {

		const hp =
			Math.max(1,
				this.stats.hp.max.value + this.stats.level.value * this.getModifier('con'));
		this.hp.max.value = hp;

	}

	/**
	 * reroll hp.
	*/
	rollBaseHp() {

		const maxHp = this.HD +
			this.stats.getModifier('con')
			+ roll(this.stats.level.value - 1, this.HD);

		this.stats.hp.max.value = maxHp;

	}

	heal(amt: number) {
		const prev = this.hp.value;
		this.hp.value += amt;
		return (this.hp.value - prev);
	}

	// recover hp without rest.
	recover() {
		const amt = Math.max(1, Math.ceil(
			this.getModifier('con') +
			this.getModifier('wis') +
			this.level.valueOf()) / 2)
		return this.heal(amt);
	}

	rest() {
		const amt = Math.max(1,
			this.getModifier('con') + this.getModifier('wis') + this.level.valueOf());
		return this.heal(amt);
	}

	applyBaseMods(mods?: StatMod) {
	}

} //cls