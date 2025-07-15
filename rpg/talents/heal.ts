import type { Char } from 'rpg/char/char';
import { type Game } from 'rpg/game';

export const Heal = {

	id: 'heal',
	name: 'heal',
	stats: ['wis', 'cha'],
	async exec(game: Game, char: Char, targ: Char): Promise<boolean> {

		if (!targ.isAlive()) {
			char.log(`${targ.name} is already dead.`);
			return false;
		}

		const amt = Math.floor((char.statRoll(...this.stats) + targ.getModifier('con')) / 5);

		if (amt < 1) {
			char.log(`You failed to heal ${targ.name}.`);
			return false;
		}

		targ.heal(amt);

		await game.send(char, `${char.name} heals ${targ.name} for ${amt} (${Math.round(targ.hp.valueOf())}/${Math.round(targ.hp.max.valueOf())}).`);
		return true;

	}

}