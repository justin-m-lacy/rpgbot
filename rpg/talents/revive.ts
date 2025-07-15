import type { Char } from 'rpg/char/char';
import { type Game } from 'rpg/game';

export const Revive = {

	id: 'revive',
	name: 'revive',
	stats: ['int', 'wis', 'cha'],
	async revive(game: Game, char: Char, targ: Char) {

		if (targ.isAlive()) {
			char.log(`${targ.name} is not dead.`);
			return;
		}

		/// pk loop prevention
		const p = game.getParty(char);
		if (!p || !p.includes(targ)) {
			char.log(`${targ.name} is not in your party.`);
			return;
		}

		let roll = char.statRoll(...this.stats) + (2 * targ.hp.value) - 5 * +targ.level;
		if (!char.hasTalent('revive')) roll -= 20;
		if (roll < 10) {
			char.log(`You failed to revive ${targ.name}.`);
			return;
		}

		char.addHistory('revived');

		targ.revive();
		char.log(`You have revived ${targ.name}.`);

	}

}