import { randomUUID } from 'crypto';
import { Formula } from 'formulic';
import { Maxable } from 'rpg/values/maxable';
import { LifeState } from '../char/actor';
import * as stats from '../char/stats';
import { DamageSrc } from '../formulas';
import { Item } from '../items/item';
import { Weapon } from '../items/weapon';
import { Dice, roll } from '../values/dice';
import { Biome } from '../world/loc';

// var formulas to parse.
const parseVars = ['hp', 'armor', 'toHit', 'mp'];

// monster template objects.
const templates: { [name: string]: MonsterTemplate } = {};
const byLevel: (MonsterTemplate[])[] = [];

const initTemplates = async () => {

	const raw = (await import('../data/npc/monster.json', { assert: { type: 'json' } })).default;

	for (let k = raw.length - 1; k >= 0; k--) {

		const t = parseTemplate(raw[k]);

		templates[t.name] = t;

		const a = byLevel[Math.floor(t.level)] ?? (byLevel[Math.floor(t.level)] = []);
		a.push(t);

	}
}
initTemplates();

function parseTemplate(json: any) {

	const t = Object.assign({}, json);

	for (let i = parseVars.length - 1; i >= 0; i--) {

		const v = parseVars[i];
		const s = t[v];
		if (typeof (s) !== 'string' || !Number.isNaN(s)) continue;

		t[v] = Dice.Parse(s);

	}
	if (t.dmg) { t.dmg = DamageSrc.Decode(t.dmg); }
	if (t.weap) {
		t.weap = Weapon.FromData(t.weap);
	}

	return t;

}

const create = (template: any) => {

	const m = new Monster();

	for (const k in template) {

		// roll data formulas into concrete numbers.
		var v = template[k];
		if (v instanceof Formula) {
			// @ts-ignore
			m[k] = v.eval(m);
		} else if (v instanceof Dice) {
			// @ts-ignore
			m[k] = v.roll();
		} else {
			// @ts-ignore
			m[k] = v;
		}

	} //for

	return m;

}


export type MonsterTemplate = {

	biome?: Biome;

	name: string;
	level: number;
	kind?: string;
	desc?: string;
	hp: string | number;
	toHit: number;

	curHp: number;
	maxHp: number;
	armor: number;
	evil: number;
	size: string;
	drops?: any;
	dmg?: any;
	weap?: any;

}

export class Monster {

	static RandMonster(lvl: number, biome?: string) {

		lvl = Math.floor(lvl);

		if (biome) {

			let ind, start;
			do {

				const a = byLevel[lvl];
				if (!a || a.length === 0) continue;

				ind = start = Math.floor(a.length * Math.random());
				do {

					const mons = a[ind];
					if (!mons.biome || mons.biome === biome ||
						(Array.isArray(mons.biome) && !mons.biome.includes(biome)))
						return create(mons);
					ind = (ind + 1) % a.length;

				} while (ind !== start);

			} while (--lvl >= 0);

		}

		do {
			const a = byLevel[lvl];
			if (a && a.length > 0) return create(a[Math.floor(a.length * Math.random())]);

		} while (--lvl >= 0);

	}

	static Decode(json: any) {

		const m = new Monster(json.id);

		if (json.name) m.name = json.name;

		if (json.hp) {
			m.hp.setTo(json.hp);
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
			level: this._level,
			hp: this._hp.toJSON(),
			curHp: this._hp,
			armor: this._armor,
			toHit: this._toHit,
			state: this._state,
			drops: this._drops ?? undefined,
			evil: this._evil ?? undefined,
			kind: this._kind ?? undefined,
			dmg: this._dmg ?? undefined,
			weap: this._weap ?? undefined

		};

	}

	get drops() { return this._drops; }
	set drops(v) { this._drops = v; }

	get template() { return this._template; }
	set template(t) { this._template = t; }

	get level() { return this._level; }
	set level(v) { this._level = v; }
	get toHit() { return this._toHit; }
	set toHit(v) { this._toHit = v; }

	get evil() { return this._evil; }
	set evil(v) { this._evil = v; }

	get kind() { return this._kind; }
	set kind(v) { this._kind = v; }

	get size() { return this._size; }
	set size(v) { this._size = v; }

	get armor() { return this._armor; }
	set armor(v) { this._armor = v; }

	get hp() { return this._hp }

	get dmg() { return this._dmg; }
	set dmg(v) { this._dmg = v; }

	/**
	 * Not yet implemented.
	get attacks() { return this._attacks; }
	set attacks(v) { this._attacks = v; }
	*/

	get weap() { return this._weap; }
	set weap(v) { this._weap = v; }

	get state() { return this._state; }
	set state(v) { this._state = v; }

	biome?: Biome;

	private _toHit: number;
	private _state: LifeState;
	private _kind?: string;

	name: string = 'unknown';
	desc?: string;

	private readonly _hp: Maxable = new Maxable('hp');

	readonly id: string;

	private _level: number = 0;
	private _armor: number = 0;
	private _evil: number = 0;
	private _size!: string;
	private _drops?: any;
	private _template?: MonsterTemplate;
	private _dmg?: any;
	private _weap?: any;
	private _attacks: any;
	private _talents?: string[];

	private _held?: Item[];

	constructor(id?: string) {
		this.id = id ?? randomUUID();
		this._toHit = 0;
		this._state = 'alive';
	}

	skillRoll() { return roll(1, 5 * (this.level + 4)); }

	hasTalent(s: string) {
		return this._talents?.includes(s);
	}

	addItem(it: Item) {

		if (!this._held) this._held = [];
		this._held.push(it);
	}

	randItem() {
		if (this._held && this._held.length > 0) {
			return this.takeItem(Math.floor(Math.random() * this._held.length));
		}
		return null;
	}
	takeItem(which: number | string | Item, sub?: number | string) {

		if (this._held) {

			if (typeof which === 'string') {

				const asInt = parseInt(which);
				if (isNaN(asInt)) {
					which = which.toLowerCase();
					which = this._held.findIndex(v => v.name == which);
				} else which = asInt;


			} else if (typeof which === 'object') {
				which = this._held.indexOf(which);
			}

			if (which >= this._held.length || which < 0) {
				return null;
			}
			return this._held.splice(which)[0];


		}
		return null;

	}

	getDetails() {

		const kind = this._kind ? ` ${this._kind}` : '';
		return `level ${this._level} ${this.name} [${stats.getEvil(this._evil)}${kind}]\nhp:${this._hp}/${this._hp.max} armor:${this._armor}\n${this.desc}`;

	}

	// combat & future compatibility.
	getModifier(stat: string) { return 0; }
	addExp(exp: number) { }
	updateState() { if (this._hp.value <= 0) this._state = 'dead'; }
	// used in combat
	getState() { return this._state; }

	getWeapons() { return this._weap; }
	getAttacks() { return this._attacks; }

	hit(dmg: number, type?: string) {

		this._hp.add(-dmg);
		if (this._hp.value <= 0) {
			this._state = 'dead';
			console.log('creature dead.');
			return true;
		}
		return false;

	}

	clone() { return Object.assign(new Monster(), this); }


}