import { Formula } from 'formulic';
import { Mob } from 'rpg/char/mobs';
import { StatusFlag } from 'rpg/char/states';
import { StatName } from 'rpg/char/stats';
import { ItemData } from 'rpg/items/types';
import { ReviveWeapon } from 'rpg/parsers/armor';
import { ParseValue } from 'rpg/parsers/values';
import { CalcFaction, Team } from 'rpg/social/teams';
import { TWritable } from 'rpg/util/type-utils';
import { Biome } from 'rpg/world/loc';
import { Numeric } from '../values/types';

type RawMobData = ItemData & any & {
	team: typeof Team[number],
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
	tohit: Numeric;
	armor: Numeric;
	evil: number;
	size?: string;
	drops?: any;
	flags?: StatusFlag;
	team?: Team;
	stats?: Record<string, StatName>,
	weap?: any;
	//attacks: TCombatAction[]

}

/// TODO: old parsing methods.
const parseVars = ['hp', 'armor', 'tohit', 'mp'];

/**
 * writable properties of Mob
 */
const writable: Partial<Record<keyof Mob | keyof MobData, boolean>> = {};

((): void => {

	const descs = Object.getOwnPropertyDescriptors<Mob>(
		new Mob(undefined, undefined)
	);
	for (let k in descs) {
		if (descs[k].writable) {
			writable[k as keyof Mob] = true;
		} else if (descs[k].set) {
			console.log('setter not writable');
			writable[k as keyof Mob] = true;
		}
	}
	writable['id'] = false;

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

	(data as MobData).team = CalcFaction(data);

	if (data.dmg) { console.log(`old dmg prop: ${data.id}`) }

	return data as MobData;

}

export const GenMob = (id: string) => {
	return templates[id] ? CreateMob(templates[id]) : null;
}

/**
 * Create mob from template
 * @param tpl 
 * @returns 
 */
const CreateMob = (tpl: MobData) => {

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

		const weap = ReviveWeapon(tpl.weap);
		if (weap) {
			m.attacks.push(weap);
		}

	}

	m.hp.setTo(tpl.hp.valueOf())

	return m;

}

export const RandMonster = (lvl: number, biome: string) => {

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
					return CreateMob(mons);
				ind = (ind + 1) % a.length;

			} while (ind !== start);

		} while (--lvl >= 0);

	}

	do {
		const a = byLevel[lvl];
		if (a?.length) return CreateMob(
			a[Math.floor(a.length * Math.random())]);

	} while (--lvl >= 0);

}


/**
 * Decode mob from saved json data.
 * @param json 
 * @returns 
 */
export const ReviveMob = (json: any) => {

	const proto = GetMob(json.proto ?? json.name);
	const m = new Mob(json.id ?? undefined, proto);

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

	if (proto?.weap) {
		m.attacks.push(ReviveWeapon(proto.weap));
	}

	if (json.tohit) m.tohit = Number(json.tohit);
	if (json.armor && typeof json.armor === 'number') {
		m.armor = json.armor;
	}

	return m;

}

