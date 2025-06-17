import { randElm } from '@/utils/jsutils';
import { AddValues } from 'rpg/values/apply';
import { Char } from '../char/char';
import { Race, type GClass } from '../char/race';
import * as Dice from '../values/dice';
import * as ItemGen from './itemgen';

type ValueRoller = { rolls: number, die: number, mod: number, minVal?: number, maxVal?: number };
type PickValues = { pick: string[] }
type StatList = { stat: string | string[] };

type StatGen = (StatList & PickValues) | (StatList & ValueRoller);

// Defines rolling information for stats.
const statRolls = [

	{ stat: ['str', 'dex', 'con', 'wis', 'int', 'cha'], rolls: 3, die: 6, mod: 0, min: 3, max: undefined },
	{ stat: 'sex', pick: ['f', 'm'] },
	{ stat: 'gold', rolls: 3, die: 4, mod: 1 }

];

export const GenChar = (owner: string, race: Race, charClass: GClass, name: string, sex?: string) => {

	const char = new Char(name, race, charClass, owner);

	const statVals = rollStats(statRolls);

	AddValues(char, statVals);

	race.onNewChar(char);
	charClass.onNewChar(char);

	boundStats(char);
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

function boundStat(dest: any, stat: string, info: { min?: number, max?: number }) {

	const cur = dest[stat];
	if (cur == null) return;

	if (info.min != null && cur < info.min) {
		dest[stat] = info.min;
	} else if (info.max != null && cur > info.max) {
		dest[stat] = info.max;
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
const boundStats = (char: Char) => {

	const stats = statRolls;
	for (let i = stats.length - 1; i >= 0; i--) {

		const info = stats[i];
		if (info.min == null && info.max == null) continue;

		const stat = info.stat;

		if (Array.isArray(stat)) {

			for (let j = stat.length - 1; j >= 0; j--) {
				boundStat(char, stat[j], info);
			}

		} else {

			boundStat(char, stat, info)

		}

	}

}

const initItems = (char: Char) => {

	let count = Math.floor(1 + 3 * Math.random());

	for (count; count >= 0; count--) {
		char.addItem(ItemGen.getMiscItem());
	}
	char.addItem([ItemGen.genWeapon(1), ItemGen.genArmor(null, 1)]);

}