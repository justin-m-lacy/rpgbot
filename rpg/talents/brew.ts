import type { Char } from 'rpg/char/char';
import { type Game } from 'rpg/game';
import { GenPotion } from 'rpg/parsers/potions';

export const Brew = {

	id: 'brew',
	name: 'Brew Potions',
	trained: true,
	stats: ['int', 'wis', 'cha'],
	exec(game: Game, char: Char, itemName: string) {

		const pot = GenPotion(itemName);
		if (!pot) return `${char.name} does not know how to brew ${itemName}.`;

		const s = char.statRoll(...this.stats);
		if (s < 10 * pot.level) {
			return char.output(`${char.name} failed to brew ${itemName}.`);
		}

		if (pot.level) char.addExp(2 * pot.level);
		char.addHistory('brew');
		const ind = char.addItem(pot);

		return char.output(`${char.name} brewed ${itemName}. (${ind})`);

	}

}