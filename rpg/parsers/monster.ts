import { Formula } from 'formulic';
import { StatusFlags } from 'rpg/char/states';
import { DamageSrc } from 'rpg/formulas';
import { Weapon } from 'rpg/items/weapon';
import { Monster } from 'rpg/monster/monster';
import { Dice } from 'rpg/values/dice';
import { Biome } from 'rpg/world/loc';

export type MonsterData = {

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
	flags?: StatusFlags;

}

// var formulas to parse.
const parseVars = ['hp', 'armor', 'toHit', 'mp'];

// monster template objects.
const templates: { [name: string]: MonsterData } = {};
const byLevel: (MonsterData[])[] = [];

export const GetMonster = (id: string) => {
	return templates[id];
}

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

const create = (template: MonsterData) => {

	const m = new Monster(undefined, template);

	let k: keyof MonsterData;
	for (k in template) {

		// roll data formulas into concrete numbers.
		const v = template[k];
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

export const RandMonster = (lvl: number, biome?: string) => {

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