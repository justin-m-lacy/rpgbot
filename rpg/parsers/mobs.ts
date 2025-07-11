import { Formula } from 'formulic';
import { Faction } from 'rpg/char/factions';
import { StatusFlags } from 'rpg/char/states';
import { ItemData } from 'rpg/items/types';
import { Weapon } from 'rpg/items/weapon';
import { Mob } from 'rpg/monster/mobs';
import { ParseValue } from 'rpg/parsers/values';
import { TWritable } from 'rpg/util/type-utils';
import { IsCoord } from 'rpg/world/coord';
import { Biome } from 'rpg/world/loc';
import { Numeric } from '../values/types';

type RawMobData = ItemData & any & {
	weap?: any;
};

export type MobData = {

	biome?: Biome;

	id: string;
	name: string;
	level: number;
	kind?: string;
	desc?: string;
	hp: Numeric;
	toHit: Numeric;
	armor: Numeric;
	evil: number;
	size?: string;
	drops?: any;
	flags?: StatusFlags;
	team?: Faction;
	weap?: any;
	//attacks: TCombatAction[]

}

/// TODO: old parsing methods.
const parseVars = ['hp', 'armor', 'toHit', 'mp'];

/**
 * writable properties of Mob
 */
const writable: Partial<Record<keyof Mob | keyof MobData, boolean>> = {};

((): void => {

	const descs = Object.getOwnPropertyDescriptors<Mob>(new Mob());
	for (let k in descs) {
		if (descs[k].writable) {
			writable[k as keyof Mob] = true;
		} else if (descs[k].set) {
			console.log('setter not writable');
			writable[k as keyof Mob] = true;
		}
	}

})();


// monster template objects.
const templates: { [name: string]: MobData } = {};
const byLevel: (MobData[])[] = [];

export const GetMob = (id: string) => {
	return templates[id];
}

const InitMobs = async () => {

	const raw = (await import('data/npc/mobs.json', { assert: { type: 'json' } })).default;

	for (let k = raw.length - 1; k >= 0; k--) {

		const t = parseTemplate(raw[k]);

		templates[t.name] = t;

		const a = byLevel[Math.floor(t.level)] ?? (byLevel[Math.floor(t.level)] = []);
		a.push(t);

	}

}

InitMobs();

/**
 * Parse mob template
 * @param data 
 * @returns 
 */
const parseTemplate = (data: RawMobData) => {

	for (let i = parseVars.length - 1; i >= 0; i--) {

		const prop = parseVars[i];

		if (typeof data[prop] === 'number') {
			data[prop] = data[prop]
		}
		const v = ParseValue(prop, data[prop]);
		if (v) {
			data[prop] = v;
		}

	}

	if (data.name) {
		data.id ??= data.name;
	} else if (data.id) {
		data.name ??= data.id;
	}

	if (data.dmg) { console.log(`deprecated dmg prop: ${data.id}`) }

	return data as MobData;

}

const create = (tpl: MobData) => {

	const m = new Mob(undefined, tpl);

	let k: keyof MobData;
	for (k in tpl) {

		// skip nonwritable properties. (hp, biome, etc.)
		if (!(k in m) || !writable[k]) continue;

		// roll data formulas into concrete numbers.
		const v = tpl[k];

		if (v instanceof Formula) {
			//@ts-ignore
			(m as TWritable<Mob>)[k] = v.eval(m);
		} else {
			//@ts-ignore
			(m as TWritable<Mob>)[k] = v;
		}

	} //for

	if (tpl.weap) {

		const weap = Weapon.Decode(tpl.weap);
		if (weap) {
			m.attacks.push(weap);
		}

	}

	m.hp.setTo(tpl.hp.valueOf())

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
					(Array.isArray(mons.biome) && mons.biome.includes(biome)))
					return create(mons);
				ind = (ind + 1) % a.length;

			} while (ind !== start);

		} while (--lvl >= 0);

	}

	do {
		const a = byLevel[lvl];
		if (a?.length) return create(
			a[Math.floor(a.length * Math.random())]);

	} while (--lvl >= 0);

}


/**
 * Decode mob from saved json data.
 * @param json 
 * @returns 
 */
export const DecodeMob = (json: any) => {

	const proto = GetMob(json.proto ?? json.name);
	const m = new Mob(json.id, proto);

	if (json.name) m.name = json.name;

	if (json.hp) {
		m.hp.setTo(json.hp);
	}
	if (IsCoord(json.at)) {
		m.at.setTo(json.at);
	}

	const desc = Object.getOwnPropertyDescriptors(m);
	for (const k in json) {

		if (!desc[k] || desc[k].writable) {
			desc[k] = json[k];
		} else {
			console.log(`no write: ${k}`);
		}

	}

	if (proto?.weap) {
		m.attacks.push(Weapon.Decode(proto.weap));
	}

	if (m.toHit) m.toHit = Number(m.toHit);
	return m;

}

