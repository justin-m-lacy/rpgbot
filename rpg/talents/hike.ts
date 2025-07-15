import { Char } from 'rpg/char/char';
import { Game } from 'rpg/game';
import { smallNum } from 'rpg/util/format';
import { TCoord } from 'rpg/world/coord';
import { DirString, toDirection } from 'rpg/world/loc';
import { DirVal } from '../world/loc';
import { World } from '../world/world';


export const Hike = {

	id: 'hike',
	stats: ['dex', 'wis'],
	async exec(game: Game, char: Char, dir: DirVal): Promise<any> {
		const d = char.at.abs();

		let r = char.statRoll(...this.stats);
		const p = game.getParty(char);

		r -= d / 10;
		if (p && p.isLeader(char)) r -= 20;
		if (!char.hasTalent(this.id)) r -= 20;

		if (r < 0) {
			char.hp.add(-Math.floor(Math.random() * d));
			return char.output(`${char.name} was hurt trying to hike. hp: (${smallNum(char.hp)}/${Math.ceil(char.hp.max.valueOf())})`);
		}
		else if (r < 10) return char.output('You failed to find your way.');

		const loc = await HikeFn(game.world, char, toDirection(dir));
		if (!loc) return char.output('You failed to find your way.');

		if (p && p.leader === char.name) {
			await p.move(game.world, loc);

		}

		return char.output(`${char.name}: ${loc.look(char)}`);
	}


}

export const HikeFn = async (world: World, char: Char, dir: DirString) => {

	let nxt: TCoord;

	switch (dir) {
		case 'n':
		case 'north':
			nxt = { x: char.at.x, y: char.at.y + 1 };
			break;
		case 's':
		case 'south':
			nxt = { x: char.at.x, y: char.at.y - 1 };
			break;
		case 'e':
		case 'east':
			nxt = { x: char.at.x + 1, y: char.at.y };
			break;
		case 'w':
		case 'west':
			nxt = { x: char.at.x - 1, y: char.at.y };
			break;
		default:
			return;
	}

	return await world.move(char, await world.getOrGen(char.at, char), nxt);

}