import { randElm } from '@/utils/jsutils';
import type { StatKey } from 'rpg/char/stats';
import { Game } from 'rpg/game';
import { GenArmor } from 'rpg/parsers/armor';
import { GenWeapon } from 'rpg/parsers/weapon';
import type { SexType } from 'rpg/social/gender';
import { IsSimple, IsValue, Numeric } from 'rpg/values/types';
import { Char } from '../char/char';
import { GClass, Race } from '../char/race';
import * as Dice from '../values/dice';
import * as ItemGen from './itemgen';

type StatList = { stat: string | string[] };

type ValueRoller = StatList & { rolls: number, die: number, mod: number, min?: number, max?: number };
type PickValues = StatList & { pick: string[] }


type StatGen = PickValues | ValueRoller;


// Defines rolling information for stats.
const statRolls = [

	{ stat: ['str', 'dex', 'con', 'wis', 'int', 'cha'], rolls: 3, die: 6, mod: 0, min: 3 },
	{ stat: 'sex', pick: ['f', 'm'] },
	{ stat: 'gold', rolls: 3, die: 4, mod: 1 }

];

export const GenChar = (
	opts: {
		game: Game,
		owner: string, race: Race, cls: GClass, name: string, sex?: SexType
	}) => {

	const char = new Char(opts.name, opts);

	const statVals = rollStats(statRolls);

	char.setBaseStats(statVals);

	opts.race.onNewChar(char);
	opts.cls.onNewChar(char);

	clampStats(char, statRolls);

	char.init();

	initItems(char);

	return char;

}

function rollStats(statRolls: StatGen[], dest: Record<string, number> = {}) {

	for (let i = statRolls.length - 1; i >= 0; i--) {

		const rollInfo = statRolls[i];
		const stat = rollInfo.stat;

		// roll array of stats.
		if (Array.isArray(stat)) {

			for (let j = stat.length - 1; j >= 0; j--) {
				rollStat(dest, stat[j], rollInfo);
			}

		} else {

			rollStat(dest, stat, rollInfo)

		}

	}

	return dest;

}

function clampStat(dest: Char, stat: StatKey, info: { min?: number, max?: number }) {

	const cur = dest[stat as keyof Char] as Numeric;

	if (info.min != null && cur.valueOf() < info.min) {

		if (IsSimple(cur)) {
			cur.setTo(info.min);
		} else if (IsValue(cur)) {
			cur.value = info.min;
		}
	} else if (info.max != null && cur.valueOf() > info.max) {

		if (IsSimple(cur)) {
			cur.setTo(info.max);
		} else if (IsValue(cur)) {
			cur.value = info.max;
		}
	}

}

const rollStat = (destObj: Record<string, number>, stat: string,
	info: { pick: any[] } | { rolls: number, die: number, mod: number }) => {

	if ('pick' in info) {
		// choose from set.
		if (destObj.hasOwnProperty(stat)) return;	// already set.
		destObj[stat] = randElm(info.pick);

	} else {
		destObj[stat] = Dice.roll(info.rolls, info.die, info.mod);
	}

}

/**
 * Bound stats by stat definitions min/max.
 * @param char
 */
const clampStats = (char: Char, gens: StatGen[]) => {

	for (let i = gens.length - 1; i >= 0; i--) {

		const info = gens[i];
		if ('pick' in info) continue;

		if (info.min == null && info.max == null) continue;

		const stat = info.stat;

		if (Array.isArray(stat)) {

			for (let j = stat.length - 1; j >= 0; j--) {
				clampStat(char, stat[j] as StatKey, info);
			}

		} else {

			clampStat(char, stat as StatKey, info)

		}

	}

}

const initItems = (char: Char) => {

	let count = Math.floor(1 + 3 * Math.random());

	for (count; count >= 0; count--) {
		char.addItem(ItemGen.GenMiscItem());
	}
	char.addItem([GenWeapon(1), GenArmor(null, 1)]);

}