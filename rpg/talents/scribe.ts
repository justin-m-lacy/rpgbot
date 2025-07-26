import { Spell } from 'rpg/actions/spell.js';
import type { Char } from 'rpg/char/char';
import { type Game } from 'rpg/game';
import { Scroll } from 'rpg/items/scroll';
import { AddValues, MissingProp } from 'rpg/values/apply';

export const Scribe = {

	id: 'scribe',
	name: 'scribe',
	trained: true,
	stats: ['int'],
	exec(game: Game, char: Char, spell: Spell): boolean {

		if (spell.cost) {
			const missing = MissingProp(char, spell.cost);
			if (missing) {
				char.log(`Not enough ${missing} to scribe ${spell.name}`);
				return false;
			} else {
				AddValues(char, spell.cost);
			}

		}

		if (spell.level) char.addExp(2 * spell.level.valueOf());
		const scroll = new Scroll(spell);
		const ind = char.addItem(scroll);

		char.log(`${char.name} scribes ${scroll.name}. (${ind})`);
		return true;

	}

}