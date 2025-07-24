import { TActor } from "rpg/char/mobs";
import { StatusFlag } from "rpg/char/states";
import { TargetFlags } from "rpg/combat/targets";
import { ProtoDot } from "rpg/magic/dots";
import { Party } from "rpg/social/party";
import { Path } from "rpg/values/paths";
import { Id, Numeric, TValue } from "rpg/values/types";

export type CombatActor = TActor | Party;

export enum ActionFlags {

	none = 0,

	// attack cant be blocked.
	nodefense = 2,

}

export type TNpcAction = {

	id: Id;
	name: string;
	type?: string;

	/// level of attack or effect.
	level?: number;

	kind?: Id;

	cost?: Path<Numeric>,

	tohit?: Numeric;
	dmg?: Numeric;
	bonus?: Numeric;

	range?: Numeric;

	///Allowed targets for action.
	target?: TargetFlags;

	/// percent of damage leeched.
	leech?: TValue;

	heal?: Numeric;

	hits?: TNpcAction[];

	/**
	 * summons.
	 */
	summon?: string[];

	// flags that apply to the action itself.
	actFlags?: ActionFlags;

	/// Status flags to set on target.
	setFlags?: StatusFlag;
	/// Status flags to remove from target.	
	cure?: StatusFlag;

	/**
	 * Values to add from action.
	 */
	add?: Path<TValue>

	/// Dot to apply to target if successful.
	dot?: ProtoDot;

}