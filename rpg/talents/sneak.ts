import type { Char } from 'rpg/char/char';
import { TActor } from 'rpg/char/mobs';
import { StatusFlag } from 'rpg/char/states';
import { type Game } from 'rpg/game';

export const Sneak = {

	id: 'sneak',
	name: 'sneak',
	stats: ['dex', 'cha'],
	async exec(game: Game, char: Char): Promise<boolean> {

		const loc = await game.world.fetchLoc(char.at);

		if (loc) {

			let spotter: TActor | null = null;
			for (let i = loc.npcs.length - 1; i >= 0; i--) {
				// -10 for hiding in view.
				if (game.combat.spotTest(char, loc.npcs[i], -10)) {
					spotter = loc.npcs[i];
					break;
				}
			}
			if (!spotter) {
				for (let i = loc.chars.length - 1; i >= 0; i--) {

					const other = game.getChar(loc.chars[i])
					if (other && game.combat.spotTest(char, other), -10) {
						spotter = other ?? null;
						break;
					}

				}
			}
			if (spotter) {
				await game.send(char, `${char.name} was spotted by ${spotter.name}.`);
				return false;
			}

		}

		char.flags.set(StatusFlag.hidden);
		char.log(`${char.name} is moving steathily.`);
		return true;


	}

}