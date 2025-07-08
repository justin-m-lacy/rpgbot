import { Formula } from 'formulic';
import { Faction } from 'rpg/char/factions';
import { StatusFlags } from 'rpg/char/states';
import { DamageSrc } from 'rpg/formulas';
import { Weapon } from 'rpg/items/weapon';
import { Mob } from 'rpg/monster/mobs';
import { ParseValue } from 'rpg/parsers/values';
import { Dice } from 'rpg/values/dice';
import { Biome, TCoord } from 'rpg/world/loc';

export type MobData = {

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
	size?: string;
	drops?: any;
	dmg?: any;
	weap?: any;
	flags?: StatusFlags;
	team?: Faction;

}

/// TODO: old parsing methods.
const parseVars = ['hp', 'armor', 'toHit', 'mp'];

// monster template objects.
const templates: { [name: string]: MobData } = {};
const byLevel: (MobData[])[] = [];

export const GetMonster = (id: string) => {
	return templates[id];
}

const InitMobs = async () => {

	const raw = (await import('../data/npc/mobs.json', { assert: { type: 'json' } })).default;

	for (let k = raw.length - 1; k >= 0; k--) {

		const t = parseTemplate(raw[k]);

		templates[t.name] = t;

		const a = byLevel[Math.floor(t.level)] ?? (byLevel[Math.floor(t.level)] = []);
		a.push(t);

	}
}

InitMobs();

function parseTemplate(data: any) {

	for (let i = parseVars.length - 1; i >= 0; i--) {

		const prop = parseVars[i];

		if (typeof data[prop] === 'number') {
			continue;
		}

		const v = ParseValue(prop, data[prop]);
		if (v) {
			data[prop] = v;
		}

	}
	if (data.dmg) { data.dmg = DamageSrc.Decode(data.dmg); }
	if (data.weap) {
		data.weap = Weapon.Decode(data.weap);
	}

	return data;

}

const create = (template: MobData, at: TCoord) => {

	const m = new Mob(undefined, template);

	let k: keyof MobData;
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

	m.at.setTo(at);

	return m;

}

export const RandMonster = (lvl: number, at: TCoord, biome?: string) => {

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
					(Array.isArray(mons.biome) && mons.biome.includes(biome)))
					return create(mons, at);
				ind = (ind + 1) % a.length;

			} while (ind !== start);

		} while (--lvl >= 0);

	}

	do {
		const a = byLevel[lvl];
		if (a?.length) return create(
			a[Math.floor(a.length * Math.random())],
			at
		);

	} while (--lvl >= 0);

}