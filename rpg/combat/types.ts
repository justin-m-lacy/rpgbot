import { StatusFlags } from "rpg/char/states";
import { TargetFlags } from "rpg/combat/targets";
import { ProtoDot } from "rpg/magic/dots";
import { TActor } from "rpg/monster/mobs";
import { Party } from "rpg/social/party";
import { Path } from "rpg/values/paths";
import { Id, Numeric, TValue } from "rpg/values/types";

export type CombatActor = TActor | Party;

export enum ActionFlags {
	none = 0,

	// action is harmless
	harmless = 1,
	// attack cant be blocked.
	nodefense = 2
}

export type TCombatAction = {

	id: Id;
	name: string;
	type?: string;
	kind?: Id;

	tohit?: Numeric;
	dmg?: Numeric;
	bonus?: Numeric;

	range?: Numeric;

	///Allowed targets for action.
	target?: TargetFlags;

	/// percent of damage leeched.
	leech?: TValue;

	heal?: Numeric;

	hits?: TCombatAction[];

	// flags that apply to the action itself.
	actFlags?: ActionFlags;

	/// level of attack or effect.
	level?: number;

	/// Status flags to set on target.
	setFlags?: StatusFlags;
	/// Status flags to remove from target.	
	cure?: StatusFlags;

	/**
	 * Values to add from action.
	 */
	add?: Path<TValue>

	/// Dot to apply if successful.
	dot?: ProtoDot;

}