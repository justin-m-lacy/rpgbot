import { TGameAction } from 'rpg/actions';
import { SpellList } from 'rpg/actions/spelllist.js';
import { GClass, Race } from 'rpg/char/race';
import { Game } from 'rpg/game';
import type { ItemIndex } from 'rpg/items/container';
import { Weapon } from 'rpg/items/weapon';
import { SexType } from 'rpg/social/gender';
import { smallNum } from 'rpg/util/format';
import { ApplyMods, RemoveMods } from 'rpg/values/modding';
import { Log } from '../display/log';
import { Inventory } from '../inventory';
import { Item, TStacker } from '../items/item';
import { HumanSlot, Wearable } from '../items/wearable';
import { roll } from '../values/dice';
import { Coord } from '../world/coord';
import { Actor } from './actor';
import { Equip } from './equip';
import { History } from './events';
import { tryLevel } from './level';
import { StatIds } from './stat';

export class Char extends Actor {

	get exp() { return this._exp; }
	set exp(v) { this._exp = v; }

	get statPoints() { return this._statPts; }
	set statPoints(v) { this._statPts = v; }

	get spentPoints() { return this._spentPts; }
	set spentPoints(v) { this._spentPts = v; }

	get skillPts() { return this._skillPts; }
	set skillPts(v) { this._skillPts = v; }

	toJSON() {

		const json: any = super.toJSON();

		json.equip = this._equip;
		json.home = this.home;
		json.guild = this.guild;
		json.inv = this.inv;
		json.statPoints = this.statPoints;
		json.spentPoints = this.spentPoints;
		json.inv = this.inv;
		json.history = this.history;
		json.exp = this.exp;
		json.owner = this.owner;

		return json;
	}

	guild?: string;

	private readonly _log: Log = new Log();
	readonly inv: Inventory;
	private _equip: Equip;
	private _statPts: number;
	private _spentPts: number;
	private _skillPts: number = 0;
	owner: string;
	private _exp: number = 0;

	home?: Coord;
	readonly history: History;

	readonly spelllist: SpellList = new SpellList('spells');

	constructor(name: string,
		opts: {
			game: Game<Record<string, TGameAction>>,
			race: Race, cls: GClass, owner: string, sex?: SexType
		}) {

		super(name, opts);

		this._statPts = 0;
		this._spentPts = 0;

		this.inv = new Inventory({ id: this.id + '_inv' });
		this._equip = new Equip();

		this.history = { explore: 0 };

		this.owner = opts.owner;

	}

	/**
	 * Runs every time char is loaded from storage.
	 */
	public init() {
		this.race?.onInitChar(this);
		this.gclass?.onInitChar(this);
	}

	/**
	 * Add single point to the given stat.
	 * @param stat
	 */
	addStat(stat: string) {

		stat = stat.toLowerCase();
		if (!StatIds.includes(stat)) {
			this.log('Stat not found');
			return false;
		}
		if (this._spentPts >= this._statPts) {
			this.log('No stat points available.');
			return false;
		}

		this.stats[stat]?.add(1);
		this._spentPts++;

		return true;

	}

	hasTalent(t: string) {
		return (this.talents?.includes(t)) || this.gclass!.hasTalent(t) || this.race.hasTalent(t);
	}

	addHistory(evt: keyof History) {
		this.history[evt] = (this.history[evt] ?? 0) + 1;
	}

	levelUp() {

		super.levelUp();

		this.log(this.name + ' has leveled up.');
		this._statPts++;
		this.events.emit('levelUp', this);

	}

	addExp(amt: number) {
		this.exp += amt;
		tryLevel(this);
	}

	/**
	 *
	 * @param what
	 * @returns Error message or true.
	 */
	equip(what: ItemIndex) {

		const item = this.inv.get(what);
		if (!item) {
			this.log('Item not found');
			return false;
		}
		if (!this._equip.canEquip(item)) {
			console.log(`${(item as any).slot}`)
			this.log(item.name + ' cannot be equipped.');
			return false;
		}

		const removed = this._equip.equip(item);
		this.applyEquip(item);
		this.inv.take(item);
		if (removed) {
			this.removeEquip(removed);
			this.inv.add(removed);
		}

		return true;

	}

	unequip(slot: HumanSlot) {

		const removed = this._equip.removeSlot(slot);
		if (!removed) return;

		this.removeEquip(removed);
		this.inv.add(removed);

		return removed;

	}

	setEquip(e: Equip) {

		this._equip = e;
		for (let it of e.items()) {

			if (Array.isArray(it)) {
				it.forEach(it => this.applyEquip(it));
			} else this.applyEquip(it);

		}

	}

	private applyEquip(it: Wearable) {

		console.log(`chararmor: ${this.armor.valueOf()}  ${it.name} armor: ${it.armor}`)
		if (it.mods) {
			ApplyMods(this, it.mods);
		}
		console.log(`newchararmor: ${this.armor.valueOf()}`);
		if (it instanceof Weapon) {
			this.attacks.push(it);
		}

	}

	/**
	 * @param wot
	 */
	private removeEquip(wot: Item | Item[]) {

		if (Array.isArray(wot)) {

			for (let i = wot.length - 1; i >= 0; i--) {
				this.removeEquip(wot[i]);
			}

		} else if (wot instanceof Wearable) {

			if (wot.mods) {
				RemoveMods(this, wot.mods);
			}

			const ind = this.attacks.indexOf(wot);
			if (ind >= 0) {
				this.attacks.splice(ind, 1);
			}


		}

	}

	/**
	 * Returns the item in the given equipment slot.
	 * @param slot
	 */
	getEquip(slot: HumanSlot) { return this._equip.get(slot); }

	listEquip() { return this._equip.getList(); }

	/**
	 * Remove and returns a random item, or null.
	 */
	randItem() { return this.inv.randItem(); }

	/**
	 * Get item from inventory without removing it.
	 * @param which
	 */
	getItem(which: number | string, sub?: number | string) {
		return this.inv.getSub(which, sub);
	}

	/**
	 * Add an item to inventory.
	 * @param it
	 */
	addItem(it?: Item | (Item | null | undefined)[] | null) {

		if (Array.isArray(it)) {
			const ind = this.inv.size;
			for (let i = 0; i < it.length; i++) {
				this.inv.add(it[i]?.onTake(this));
			}
			return ind;
		} else {
			return this.inv.add(it?.onTake(this));
		}

	}

	/**
	 * Remove item from inventory and return it.
	 * @param which
	 * @returns Item removed or null.
	 */
	removeItem(which: number | string | Item) {
		return this.inv.take(which);
	}

	/**
	 * Remove count of stackable item.
	 * @param which 
	 * @param n 
	 */
	removeN(which: Item & TStacker, n: number = 1) {
		return this.inv.removeN(which, n);
	}

	removeRange(start: ItemIndex, end: ItemIndex) { return this.inv.takeRange(start, end); }

	/**
	 * reroll hp.
	*/
	rollBaseHp() {

		const maxHp = Math.floor((this.race.HD + this.gclass!.HD) / 2) +
			roll(this.level.value - 1, this.gclass!.HD);

		this.hp.max.value = maxHp;

	}

	getTalents() {

		if (!this.talents || this.talents.length == 0) return `${this.name} has no talents.`;
		return this.name + "'s Talents:" + this.talents.join('\n');

	}

	testDmg() {

		const atks = this.attacks;
		if (atks.length == 0) return 'No weapons equipped.';

		let res = '';
		for (let i = atks.length - 1; i >= 0; i--) {
			res += atks[i].name + ' rolled: ' + (atks[i].dmg ?? 0).valueOf() + '\n';
		}
		return res;

	}

	getDetails() {

		return `${this.name} level ${this.level} ${this.race.name} ${this.gclass?.name ?? ''} [${this.evil}]\nhp:${smallNum(this.hp)}/${smallNum(this.hp.max)} armor:${this.armor.valueOf()}`;

	}

	/**
	 * Log character string, replacing %c with character name.
	 * @param s 
	 */
	log(s: string) {
		this._log.log(s.replace('%c', this.name));
	}
	flushLog() { return this._log.flushLog(); }

	clearLog() { this._log.clear(); }

}