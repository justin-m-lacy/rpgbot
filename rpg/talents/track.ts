import type { Char } from 'rpg/char/char';
import { type Game } from 'rpg/game';

export const Track = {

	id: 'track',
	name: 'track',
	stats: ['cha', 'wis'],
	exec(game: Game, char: Char, targ: Char) {

		let r = char.statRoll(...this.stats);
		if (char.hasTalent('track')) r *= 2;
		else r -= 10;

		const src = char.at;
		const dest = targ.at;
		const d = src.dist(dest);

		if (d === 0) return char.log(`${targ.name} is here.`);
		else if (d <= 2) return char.log(`You believe ${targ.name} is nearby.`);
		else if (d > r) return char.log(`You find no sign of ${targ.name}`);

		const a = Math.atan2(dest.y - src.y, dest.x - src.x) * 180 / Math.PI;
		const abs = Math.abs(a);

		let dir;
		if (abs < (90 - 45 / 2)) dir = 'east';
		else if (abs > (180 - (45 / 2))) dir = 'west';

		if (a > 0 && Math.abs(90 - a) < (3 * 45) / 2) dir = dir ? 'north ' + dir : 'north';
		else if (a < 0 && Math.abs(-90 - a) < (3 * 45) / 2) dir = dir ? 'south ' + dir : 'south';

		let dist;
		if (d < 20) dist = '';
		else if (d < 50) dist = 'somewhere';
		else if (d < 125) dist = 'far';
		else if (d < 225) dist = 'incredibly far';
		else if (d < 300) dist = 'unbelievably far';
		else dist = 'imponderably far';

		return char.log(`You believe ${targ.name} is ${dist ? dist + ' ' : ''}to the ${dir}.`);

	}

}