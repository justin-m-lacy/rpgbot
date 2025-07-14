import { Char } from 'rpg/char/char';
import { TCoord } from 'rpg/world/coord';
import { DirString } from 'rpg/world/loc';
import { World } from '../world/world';

export const Hike = async (world: World, char: Char, dir: DirString) => {

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