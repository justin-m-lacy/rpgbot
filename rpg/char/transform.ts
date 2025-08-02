import { Char } from "rpg/char/char";
import { Mob } from "rpg/char/mobs";

/**
 * Transform character to a typed mod.
 * @param char 
 */
export const transformChar = (char: Char) => {

	const m = new Mob(undefined,);

	m.hp.setMax(char.hp.max);
	m.level = char.level.valueOf();


	return m;

}