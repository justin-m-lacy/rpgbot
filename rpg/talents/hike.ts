import { Char } from 'rpg/char/char';
import { Game } from 'rpg/game';
import { smallNum } from 'rpg/util/format';
import { TCoord } from 'rpg/world/coord';
import { DirString, toDirection } from 'rpg/world/loc';
import { DirVal } from '../world/loc';


export const Hike = {

	id: 'hike',
	stats: ['dex', 'wis'],
	async exec(game: Game, char: Char, dir: DirVal): Promise<boolean> {
		const d = char.at.abs();

		let r = char.statRoll(...this.stats);
		const p = game.getParty(char);

		r -= d / 10;
		if (p && p.isLeader(char)) r -= 20;
		if (!char.hasTalent(this.id)) r -= 20;

		if (r < 0) {
			char.hp.add(-Math.floor(Math.random() * d));
			char.log(`${char.name} was injured trying to hike. hp: (${smallNum(char.hp)}/${smallNum(char.hp.max)})`);
			return false;
		}
		else if (r < 10) {
			char.log('You failed to find your way.');
			return false;
		}

		const to = nextCoord(char.at, toDirection(dir));
		if (!to) {
			char.log('Invalid direction.');
			return false;
		}

		const loc = await game.world.move(char, await game.world.getOrGen(char.at, char), to);
		if (!loc) {
			char.log('You failed to find your way.');
			return false;
		}

		if (p && p.leader === char.name) {
			await p.move(game.world, loc);
		}

		char.log(loc.look(char));
		return true;
	}

}

const nextCoord = (at: TCoord, dir: DirString) => {

	switch (dir) {
		case 'n':
		case 'north':
			return { x: at.x, y: at.y + 1 };
		case 's':
		case 'south':
			return { x: at.x, y: at.y - 1 };
		case 'e':
		case 'east':
			return { x: at.x + 1, y: at.y };
		case 'w':
		case 'west':
			return { x: at.x - 1, y: at.y };
		default:
			return null;
	}

}