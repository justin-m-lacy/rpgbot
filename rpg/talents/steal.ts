import type { Char } from 'rpg/char/char';
import { type Game } from 'rpg/game';
import { ItemPicker } from 'rpg/inventory';

export const Steal = {

	id: 'steal',
	name: 'steal',
	stats: ['dex', 'cha'],
	async exec(game: Game, src: Char, dest: Char, wot?: ItemPicker | null) {

		await game.combat.trySteal(src, dest, wot);
		return src.output();

	}

}