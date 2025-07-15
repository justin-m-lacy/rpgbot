import type { Char } from 'rpg/char/char';
import { type Game } from 'rpg/game';
import { GenPotion } from 'rpg/parsers/potions';

export const Brew = {

	id: 'brew',
	name: 'Brew Potions',
	trained: true,
	stats: ['int', 'wis', 'cha'],
	exec(game: Game, char: Char, itemName: string): boolean {

		const pot = GenPotion(itemName);
		if (!pot) {
			char.log(`${char.name} does not know how to brew ${itemName}.`);
			return false;
		}

		const s = char.statRoll(...this.stats);
		if (s < 10 * pot.level) {
			char.log(`${char.name} failed to brew ${itemName}.`);
			return false;
		}

		if (pot.level) char.addExp(2 * pot.level);
		const ind = char.addItem(pot);

		char.log(`${char.name} brewed ${itemName}. (${ind})`);
		return true;

	}

}