import { TGameAction } from 'rpg/actions';
import { GClass, Race } from 'rpg/char/race';
import { Game } from 'rpg/game';
import type { ItemIndex } from 'rpg/items/container';
import { Weapon } from 'rpg/items/weapon';
import { SpellList } from 'rpg/magic/spelllist';
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
import { StatIds, StatKey } from './stats';

const SaveProps: Array<keyof Char> = ['name', 'exp', 'owner', 'flags', 'stats', 'dots',
	'at', 'history', 'statPoints', 'spentPoints', 'guild', 'inv', 'talents'];

export class Char extends Actor {

	get exp() { return this._exp; }
	set exp(v) { this._exp = v; }

	get statPoints() { return this._statPoints; }
	set statPoints(v) { this._statPoints = v; }

	get spentPoints() { return this._spentPoints; }
	set spentPoints(v) { this._spentPoints = v; }

	get skillPts() { return this._skillPts; }
	set skillPts(v) { this._skillPts = v; }

	toJSON() {

		const json: any = {
			equip: this._equip,
			race: this.race.id,
			cls: this.cls?.id,
			home: this.home,
			teams: this.teams,
		};
		for (let i = SaveProps.length - 1; i >= 0; i--) {
			json[SaveProps[i]] = this[SaveProps[i] as keyof Char];
		}

		return json;
	}

	private readonly _log: Log = new Log();
	readonly inv: Inventory;
	private _equip: Equip;
	private _statPoints: number;
	private _spentPoints: number;
	private _skillPts: number = 0;
	owner: string;
	private _exp: number = 0;

	home?: Coord;
	readonly history: History;

	readonly spelllist: SpellList = new SpellList('spells');

	constructor(name: string,
		opts: {
			game: Game<Record<string, TGameAction>>,
			race: Race, cls: GClass, owner: string
		}) {

		super(name, opts);

		this._statPoints = 0;
		this._spentPoints = 0;

		this.inv = new Inventory();
		this._equip = new Equip();

		this.history = { explore: 0 };

		this.owner = opts.owner;

	}

	/**
	 * Runs every time char is loaded from storage.
	 */
	public init() {
		this.race?.onInitChar(this);
		this.cls?.onInitChar(this);
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
		if (this._spentPoints >= this._statPoints) {
			this.log('No stat points available.');
			return false;
		}

		if (stat in this.stats) {
			this.stats[stat as StatKey].add(1);
		} else {
			this.log(`Stat not found.`);
		}

		this._spentPoints++;

		return true;

	}

	hasTalent(t: string) {
		return (this.talents?.includes(t)) || this.cls!.hasTalent(t) || this.race.hasTalent(t);
	}

	addHistory(evt: keyof History) {
		this.history[evt] = (this.history[evt] ?? 0) + 1;
	}

	levelUp() {

		super.levelUp();

		this.log(this.name + ' has leveled up.');
		this._statPoints++;
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
		if (!item) return 'No such item.';

		if (item instanceof Wearable) {

			const removed = this._equip.equip(item);
			if (typeof (removed) !== 'string') {

				this.applyEquip(item);
				this.inv.take(item);
				if (removed) {
					this.removeEquip(removed);
					this.inv.add(removed);
				}

				return true;

			}
			return removed;
		} else {
			return 'Item cannot be equipped.'
		}

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
		console.log(this.name + ' armor: ' + this.armor);

	}

	private applyEquip(it: Wearable) {

		if (it.mods) {
			ApplyMods(this, it.mods);
		}
		if (it.armor) {
			this.stats.armor.add(it.armor);;
			//console.log('adding armor: ' + it.armor);
		}
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
			if (wot.armor) {
				this.stats.armor.add(-wot.armor);
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

		const maxHp = Math.floor((this.race.HD + this.cls!.HD) / 2) +
			roll(this.stats.level.value - 1, this.cls!.HD);

		this.stats.hp.max.value = maxHp;

	}

	getTalents() {

		if (!this.talents || this.talents.length == 0) return `${this.name} has no talents.`;
		return this.name + "'s Talents:" + this.talents.join('\n');

	}

	testDmg() {

		const weaps = this.attacks;
		if (weaps.length == 0) return 'No weapons equipped.';

		let res = '';
		for (let i = weaps.length - 1; i >= 0; i--) {
			res += weaps[i].name + ' rolled: ' + (weaps[i].dmg ?? 0).valueOf() + '\n';
		}
		return res;

	}

	getDetails() {

		return `${this.name} level ${this.level} ${this.race.name} ${this.cls?.name ?? ''} [${this.evil}]\nhp:${smallNum(this.hp)}/${smallNum(this.hp.max)} armor:${this.armor}`;

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