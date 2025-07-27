import * as ItemGen from 'rpg/builders/itemgen';
import { Char } from 'rpg/char/char';
import { Game } from 'rpg/game';
import { GenArmor } from 'rpg/parsers/armor';
import { GenWeapon } from 'rpg/parsers/weapon';
import type { SexType } from 'rpg/social/gender';
import { CharTeam } from 'rpg/social/teams';
import { Dice } from 'rpg/values/dice';
import { GClass, Race } from '../char/race';


const statRoll = { value: new Dice(3, 6), min: 3 };
const goldRoll = new Dice(3, 4, 1);

export const GenChar = (
	opts: {
		game: Game,
		owner: string, race: Race, cls: GClass, name: string, sex?: SexType
	}) => {

	const char = new Char(opts.name, opts);
	char.teams.setRanks(CharTeam());

	for (const k in char.stats) {

		const v = statRoll.value.value;
		char.stats[k]?.setTo(v);

	}
	char.gold = goldRoll.value;

	/// todo: replace with mods.
	opts.race.onNewChar(char);
	opts.cls.onNewChar(char);

	char.init();

	clampStats(char, statRoll);

	initItems(char);

	return char;

}

function clampStats(char: Char, roll: typeof statRoll) {

	for (const k in char.stats) {

		const stat = char.stats[k];
		if (!stat) continue;
		if (stat.value < roll.min) {
			stat.add(roll.min - stat.value);
		}

	}

}

const initItems = (char: Char) => {

	let count = Math.floor(1 + 3 * Math.random());

	for (count; count >= 0; count--) {
		char.addItem(ItemGen.GenJunkItem());
	}
	char.addItem([GenWeapon(1), GenArmor(1)]);

}