import { TargetFlags } from "rpg/combat/targets";
import { Dot } from "rpg/magic/dots";
import { quickSplice } from "rpg/util/array";

type StatusKeys = keyof typeof StatusFlag;

export enum CharState {
	Dead = 'dead',
	Alive = 'alive',
}

export enum StatusFlag {
	none = 0,
	dead = 1,
	noattack = 2,
	nodefend = 4,
	nospells = 8,
	confused = 16,
	charmed = 32,
	hidden = 64,
}

export const ParseStateFlags = (list: (keyof typeof StatusFlag)[] | string) => {

	if (typeof list === 'string') list = list.split(',') as (keyof typeof StatusFlag)[];

	let f: StatusFlag = 0;
	for (let i = list.length - 1; i >= 0; i--) {
		f |= StatusFlag[list[i]] ?? 0;
	}

	return f;

}

/**
 * Retarget map for Confused state.
 */

const ConfuseTargets: Partial<Record<number, TargetFlags>> = {
	[TargetFlags.all]: TargetFlags.random,
	[TargetFlags.allies]: TargetFlags.random,
	[TargetFlags.enemies]: TargetFlags.random,
	[TargetFlags.mult]: TargetFlags.random,
	[TargetFlags.self]: TargetFlags.random,
	[TargetFlags.none]: TargetFlags.random,
}

/**
 * Retarget map for Charmed state.
 */
const CharmTargets: Partial<Record<number, TargetFlags>> = {
	[TargetFlags.all]: TargetFlags.random,
	[TargetFlags.allies]: TargetFlags.random,
	[TargetFlags.enemies]: TargetFlags.random,
	[TargetFlags.mult]: TargetFlags.random,
	[TargetFlags.self]: TargetFlags.random,
	[TargetFlags.none]: TargetFlags.random,
};

type TCauses = Record<PropertyKey, Dot[] | undefined>;

/// Character state information.
export class CharFlags {

	// compute from initial state?
	toJSON() { return undefined; }

	setTo(flags: StatusFlag) {
		this.flags = flags;
	}

	/**
	 * @property causes - causes of each state flag.
	 */
	private readonly _causes: TCauses = {};

	get causes() { return this._causes; }

	private flags: StatusFlag = 0;

	canCast() { return (this.flags & StatusFlag.nospells) === 0 }
	canAttack() { return (this.flags & StatusFlag.noattack) === 0 }
	canDefend() { return (this.flags & StatusFlag.nodefend) === 0 }


	/// flag - state flag
	has(flag: StatusFlag) {
		return (this.flags & flag) > 0;
	}
	unset(flag: StatusFlag) {
		this.flags &= (~flag);
	}
	set(flag: StatusFlag) {
		this.flags |= flag;
	}

	constructor() {
	}

	/**
	 * Pick new target based on char state.
	 * e.g. confused, charmed, etc.
	 * @param targFlags - original target
	 */
	retarget(targFlags: TargetFlags) {

		if ((this.flags & StatusFlag.confused) > 0) {

			return targFlags ? ConfuseTargets[targFlags] ?? 0 : TargetFlags.random;

		} else if ((this.flags & StatusFlag.charmed) > 0) {

			return targFlags ? CharmTargets[targFlags] ?? 0 : TargetFlags.ally;
		}
		return targFlags;

	}

	/**
	 * Get cause of a flag being set, or null, if flag not set.
	 * @param flag
	 * @returns 
	 */
	getCause(flag: number) {
		return this._causes[flag]?.[0] ?? undefined;
	}

	/**
	 * Blame each bit-flag in flags on cause.
	 * @param cause
	 */
	add(cause: Dot) {

		const flags = cause.flags;
		if (flags === 0) return;

		let f = 1;
		while (f <= flags) {

			if ((flags & f) > 0) this._addCause(f, cause);
			f *= 2;

		}
		this.flags |= flags;

	}

	remove(dot?: Dot) {

		if (!dot) return;

		const flags = dot.flags;
		let f = 1;

		while (f <= flags) {

			if ((flags & f) > 0) this._rmCause(f, dot);
			f *= 2;

		}

	}

	_rmCause(flag: number, cause: Dot) {

		const a = this._causes[flag];
		if (!a) return;

		const ind = a.indexOf(cause);
		if (ind >= 0) {

			quickSplice(a, ind);
			if (a.length === 0) this.flags ^= flag;

		}

	}

	_addCause(flag: number, cause: Dot) {

		const a = this._causes[flag];
		if (a) a.push(cause);
		else this._causes[flag] = [cause]

	}

	/**
	 * Refresh all state flags from active dots.
	 * @param dots
	 */
	refresh(dots: Dot[]) {

		this.flags = 0;

		for (const p in this._causes) {
			this._causes[p] = undefined;
		}

		for (let i = dots.length - 1; i >= 0; i--) {

			const d = dots[i];
			if (d.flags) {
				this.add(d);
			}

		}

	}

}