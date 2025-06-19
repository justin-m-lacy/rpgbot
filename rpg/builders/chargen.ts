import { randElm } from '@/utils/jsutils';
import type { StatKey } from 'rpg/char/stats';
import { Simple } from 'rpg/values/simple';
import { Char } from '../char/char';
import { Race, type GClass } from '../char/race';
import * as Dice from '../values/dice';
import * as ItemGen from './itemgen';

type StatList = { stat: string | string[] };

type ValueRoller = StatList & { rolls: number, die: number, mod: number, min?: number, max?: number };
type PickValues = StatList & { pick: string[] }


type StatGen = PickValues | ValueRoller;


// Defines rolling information for stats.
const statRolls = [

	{ stat: ['str', 'dex', 'con', 'wis', 'int', 'cha'], rolls: 3, die: 6, mod: 0, min: 3, max: undefined },
	{ stat: 'sex', pick: ['f', 'm'] },
	{ stat: 'gold', rolls: 3, die: 4, mod: 1 }

];

export const GenChar = (owner: string, race: Race, charClass: GClass, name: string, sex?: string) => {

	const char = new Char(name, race, charClass, owner);

	const statVals = rollStats(statRolls);

	char.setBaseStats(statVals);

	race.onNewChar(char);
	charClass.onNewChar(char);

	boundStats(char, statRolls);

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

function boundStat(dest: Char, stat: StatKey, info: { min?: number, max?: number }) {

	const cur = dest[stat as keyof Char];

	if (info.min != null && cur.valueOf() < info.min) {
		if (cur instanceof Simple) {
			cur.setTo(info.min);
		}
	} else if (info.max != null && cur.valueOf() > info.max) {
		if (cur instanceof Simple) {
			cur.setTo(info.max);
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
const boundStats = (char: Char, gens: StatGen[]) => {

	for (let i = gens.length - 1; i >= 0; i--) {

		const info = gens[i];
		if ('pick' in info) continue;


		if (info.min == null && info.max == null) continue;

		const stat = info.stat;

		if (Array.isArray(stat)) {

			for (let j = stat.length - 1; j >= 0; j--) {
				boundStat(char, stat[j] as StatKey, info);
			}

		} else {

			boundStat(char, stat as StatKey, info)

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