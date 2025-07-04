import { Cook, TryEat } from 'rpg/char/cooking';
import { GClass, Race } from 'rpg/char/race';
import { Game } from 'rpg/game';
import type { ItemIndex } from 'rpg/items/container';
import { SpellList } from 'rpg/magic/spelllist';
import { ItemType } from 'rpg/parsers/items';
import { Log } from '../display/log';
import { Inventory, ItemPicker } from '../inventory';
import { Item } from '../items/item';
import { HumanSlot, Wearable } from '../items/wearable';
import { roll } from '../values/dice';
import { Coord } from '../world/loc';
import { Actor } from './actor';
import { Equip } from './equip';
import { History } from './events';
import { tryLevel } from './level';
import { StatIds, StatKey } from './stats';

const SaveProps = ['name', 'exp', 'owner', 'state', 'stats', 'effects',
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

	get evil() { return +this.stats.evil.value; }
	set evil(v) { this.stats.evil.setTo(v); }

	get id() { return this.name }

	toJSON() {

		const json: any = {};
		for (let i = SaveProps.length - 1; i >= 0; i--) {
			json[SaveProps[i]] = this[SaveProps[i] as keyof Char];
		}

		if (this.home) json.home = this.home;

		json.equip = this._equip;

		json.race = this.race.name;
		json.cls = this.cls?.name;

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
			game: Game,
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
		return tryLevel(this);
	}

	/**
	 * Eat an item from inventory.
	 * @param what
	 * @returns result message.
	 */
	eat(what: ItemIndex) {

		const item = this.inv.get(what);
		if (!item) {
			this.log('Item not found.');
		} else if (!TryEat(this, item)) {
			// return to inventory.
			this.inv.take(item);
		}

	}

	/**
	 *
	 * @param what - what to cook.
	 */
	cook(what: ItemPicker) {

		let item = what instanceof Item ? what : this.inv.get(what);
		if (!item) return 'Item not found.';

		if (item.type === ItemType.Food) return item.name + ' is already food.';

		this.addHistory('cook');
		Cook(item);
		return `${this.name} cooks '${item.name}'`;

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

	unequip(slot?: string) {

		let removed = this._equip.removeSlot(slot);
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
			}
			else this.applyEquip(it);

		}
		console.log(this.name + ' armor: ' + this.armor);

	}

	applyEquip(it: Wearable) {
		if (it.mods) {
			it.mods.apply(this.stats);
		}
		if (it.armor) {
			this.stats.armor.add(it.armor);;
			//console.log('adding armor: ' + it.armor);
		}
	}

	/**
	 *
	 * @param wot
	 */
	removeEquip(wot: Item | Item[]) {

		if (Array.isArray(wot)) {

			for (let i = wot.length - 1; i >= 0; i--) {
				this.removeEquip(wot[i]);
			}

		} else if (wot instanceof Wearable) {

			if (wot.mods) { wot.mods.remove(this.stats); }
			if (wot.armor) {
				this.stats.armor.add(-wot.armor);
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
	 * Removes and returns a random item, or null.
	 */
	randItem() { return this.inv.randItem(); }

	/**
	 * Get an item from inventory without removing it.
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
		return this.inv.add(it);

	}

	/**
	 * Remove an item from inventory and return it.
	 * @param which
	 * @returns Item removed or null.
	 */
	takeItem(which: number | string | Item, sub?: number | string) {
		return this.inv.take(which, sub);
	}

	takeRange(start: ItemIndex, end: ItemIndex) { return this.inv.takeRange(start, end); }

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

	getWeapons() { return this._equip.getWeapons(); }

	testDmg() {

		const weaps = this._equip.getWeapons();
		if (weaps === null) return 'No weapons equipped.';
		else if (Array.isArray(weaps)) {

			let res = '';
			for (let i = weaps.length - 1; i >= 0; i--) {
				res += weaps[i].name + ' rolled: ' + weaps[i].roll() + '\n';
			}
			return res;

		} else return weaps.name + ' rolled: ' + weaps.roll();

	}

	getDetails() {

		return `${this.name} level ${this.level} ${this.race.name} ${this.cls?.name ?? ''} [${this.stats.evil}]\nhp:${this.hp}/${this.hp.max} armor:${this.armor}`;

	}

	/**
	 * Log character string, replacing %c with character name.
	 * @param str 
	 */
	log(str: string) {
		this._log.log(str.replace('%c', this.name));
	}
	getLog(clear: boolean = true) {
		return this._log.getLog(clear);
	}
	output(str?: string) { return this._log.output(str); }

	clearLog() { this._log.clear(); }

}