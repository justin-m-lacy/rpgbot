import { Scroll } from "rpg/items/scroll";
import { RandSpell } from "rpg/parsers/spells";

/**
 * Generate scroll for level.
 * @param lvl 
 */
export const LvlScroll = (lvl: number = 1) => {
	return new Scroll(undefined, RandSpell(lvl));
}