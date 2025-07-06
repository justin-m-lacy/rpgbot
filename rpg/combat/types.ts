import { Char } from "rpg/char/char";
import { StatusFlags } from "rpg/char/states";
import { TargetFlags } from "rpg/combat/targets";
import { ProtoEffect } from "rpg/magic/effects";
import { Result } from "rpg/magic/results";
import { Monster, Npc } from "rpg/monster/monster";
import { Party } from "rpg/social/party";
import { Id, Numeric, TValue } from "rpg/values/types";

type CombatActor = Npc | Party;


export type TCombatAction = {

	id: Id;
	name: string;
	type?: string;
	kind?: Id;

	tohit?: Numeric;
	dmg?: Numeric;
	bonus?: Numeric;

	range?: Numeric;

	/**
	 * Allowed targets for action.
	 */
	target: TargetFlags;

	/// percent of damage leeched.
	leech?: TValue;

	heal?: Numeric;

	hits?: TCombatAction[];

	harmless?: boolean;
	nodefense?: boolean;

	/// level of attack or effect.
	level?: number;

	/// Status flags to set on target.
	setFlags?: StatusFlags;
	/// Status flags to remove from target.	
	cure?: StatusFlags;

	result?: Result<Npc>;

	/// Dot to apply if successful.
	dot?: ProtoEffect;

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



/*export class Combat {

	readonly actors: Record<string, Npc | undefined> = {};

	readonly loc: Loc;

	constructor(at: Loc) {

		this.loc = at;

	}

	update() {

	}

	addActor(m: Npc) {

		this.actors[m.id] = m;

	}

	rmActor(m: Npc) {
		this.actors[m.id] = undefined;
	}

}*/