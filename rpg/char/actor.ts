import type { SexType } from 'rpg/social/gender';
import { CanMod, type ModBlock } from 'rpg/values/imod';
import type { Numeric } from 'rpg/values/types';
import { Item } from '../items/item';
import { Weapon } from '../items/weapon';
import { Effect, ProtoEffect } from '../magic/effects';
import { roll } from '../values/dice';
import { Coord } from '../world/loc';
import { Race, type GClass } from './race';
import { StatBlock, type StatMod } from './stats';

export type LifeState = 'alive' | 'dead';

export class Actor {

	static Revive(json: any, act: Actor) {

		if (json.statMods) {
			// apply last.
			let mods = json.statMods;
			act.setMods(mods);
		}

	}

	// used to abstract await state in combat.
	getState() { return this._state; }

	getStatus() { return `${this.hp.value}/${this.hp.max} [${this._state}]` }

	get state() { return this._state; }
	set state(v) { this._state = v; }
	isAlive() { return this._state !== exports.Dead; }

	get evil() { return this.stats.evil; }
	set evil(v: Numeric) { this.stats.evil.setTo(+v); }

	// convenience for shorter formulas.
	get hp() { return this.stats.hp; }

	get dr() { return this.stats.dr; }

	get resist() { return this.resists }

	// convenience for shorter formulas.
	get mp() { return this.stats.mp; }

	get level() { return this.stats.level; }

	get gold() { return this.stats.gold; }
	set gold(g) { this.stats.gold = g < 0 ? 0 : g; }

	get age() { return this.stats.age; }
	set age(s: Numeric) { this.stats.age.setTo(s); }

	get armor() { return this.stats.armor; }

	get str() { return this.stats.str; }
	get con() { return this.stats.con; }
	set con(v: Numeric) {

		this.stats.con.setTo(v);
		this.computeHp();

	}

	get dex() { return this.stats.dex; }
	get int() { return this.stats.int; }
	get wis() { return this.stats.wis; }
	get cha() { return this.stats.cha; }


	get HD() { return this._charClass ? Math.floor((this._charClass.HD + this.race.HD) / 2) : this.race.HD; }

	get cls() { return this._charClass }

	get toHit() { return this.getModifier('dex'); }
	get loc() { return this._loc; }
	set loc(v) { this._loc.setTo(v); }

	readonly name: string;
	private readonly _loc: Coord;
	race: Race;
	readonly stats: StatBlock = new StatBlock();
	readonly effects: Effect[] = [];
	private _charClass?: GClass;
	protected _talents?: string[];

	readonly resists: Record<string, Numeric> = {};

	sex: SexType = 'm';

	guild?: string;

	/**
	 * Current mods applied to char.
	 */
	readonly mods: ModBlock<typeof this>[] = [];
	private _state: LifeState;

	constructor(name: string, race: Race, rpgClass?: GClass) {

		this.name = name;

		this._charClass = rpgClass;

		this.race = race;

		this._loc = new Coord(0, 0);

		this._state = 'alive';

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
				targ.addMod(m);
			} else {

			}

		}
		this.mods.push(mods);

	}

	/**
	 * Removes a gold amount or returns false.
	 * @param {number} amt
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

	}

	rmEffect(e: Effect | ProtoEffect) { }

	addGold(amt: number) { this.stats.gold += amt; }

	/**
	 * @param stat
	 */
	getModifier(stat: string) { return this.stats.getModifier(stat); }

	revive() {

		if (this.hp.value <= 0) this.hp.value = 1;
		this.state = exports.Alive;

	}

	getWeapons(): Weapon | Weapon[] | null { return null; }

	updateState() {
		if (this.hp.value <= 0) this.state = exports.Dead;
		else this.state = exports.Alive;
		return this.state;
	}

	/**
	 * TODO: temp
	 */
	hit(amt: number) {
		this.hp.value -= amt;
		if (this.hp.value <= 0) {
			this.state = exports.Dead;
			return exports.Dead;
		}
	}

	hasTalent(s: string) {
		return this._talents?.includes(s);
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
			this.level.value) / 2)
		return this.heal(amt);
	}

	rest() {
		const amt = Math.max(1,
			this.getModifier('con') + this.getModifier('wis') + this.level.value);
		return this.heal(amt);
	}

	applyBaseMods(mods?: StatMod) {
	}

} //cls