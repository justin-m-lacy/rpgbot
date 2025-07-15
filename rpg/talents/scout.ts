import type { Char } from 'rpg/char/char';
import { type Game } from 'rpg/game';

export const Scout = {

	id: 'scout',
	name: 'scout',
	stats: ['int', 'wis'],
	exec(game: Game, char: Char) {

		const r = char.statRoll(...this.stats)

		if (r < 5) {
			char.log('You are lost.');
			return false;
		}

		const err = Math.floor(400 / r);
		const x = Math.round(char.at.x + err * (Math.random() - 0.5));
		const y = Math.round(char.at.y + err * (Math.random() - 0.5));

		char.log(`You think you are near (${x},${y}).`);
		return true;

	}

}