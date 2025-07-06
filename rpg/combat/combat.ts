import { Char } from "rpg/char/char";
import { CombatActor, TCombatAction } from "rpg/combat/types";
import { Monster } from "rpg/monster/monster";
import { Loc } from "rpg/world/loc";

export const HasEnemies = (c: Char, loc: Loc) => {

	return loc.npcs.some(v => (v.team & c.team) == 0);

}


export const TryAttack = (char: Char, targ: CombatActor) => {

}

/**
 * Attempt to apply action to target.
 * @param char 
 * @param act 
 * @param targ 
 */
export const TryAction = (char: Char, act: TCombatAction, targ: Char | Monster) => {

}


/**
 * Apply combat action to a target.
 * @param char 
 * @param act 
 * @param targ 
 */
export const ApplyAction = (char: Char, act: TCombatAction, targ: Char | Monster) => {

}

