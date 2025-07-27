import { LoadActions } from 'rpg/actions/action.js';
import { LoadDotTypes } from 'rpg/actions/dots.js';
import { InitFeatures } from 'rpg/builders/features';
import { InitItems } from 'rpg/builders/itemgen';
import { LoadStats } from 'rpg/char/stat';
import { InitArmors } from 'rpg/parsers/armor';
import { InitClasses, InitRaces } from 'rpg/parsers/parse-class';
import { InitPotions } from 'rpg/parsers/potions';
import { LoadSpells } from 'rpg/parsers/spells';
import { InitWeapons } from 'rpg/parsers/weapon';

/**
 * Preload Rpg data.
 */
export const InitGame = async () => {

	return Promise.all([
		LoadStats(),
		InitRaces(),
		InitClasses(),
		InitItems(),
		InitFeatures(),
		InitArmors(),
		InitWeapons(),
		InitPotions(),
		LoadDotTypes(),
		LoadActions(),
		LoadSpells()
	]);

}