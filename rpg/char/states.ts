import { TargetFlags } from "rpg/combat/targets";
import { Dot } from "rpg/magic/dots";
import { quickSplice } from "rpg/util/array";

type StatusKeys = keyof typeof StatusFlags;

export enum StatusFlags {
	none = 0,
	noattack = 1,
	nodefend = 2,
	nospells = 4,
	confused = 8,
	charmed = 16,
	hide = 32,

	dead = noattack + nodefend + nospells
}

export const ParseStateFlags = (list: (keyof typeof StatusFlags)[] | string) => {

	if (typeof list === 'string') list = list.split(',') as (keyof typeof StatusFlags)[];

	let f: StatusFlags = 0;
	for (let i = list.length - 1; i >= 0; i--) {
		f |= StatusFlags[list[i]] ?? 0;
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

	toJSON() { return undefined; }

	/**
	 * @property causes - causes of each state flag.
	 */
	private readonly _causes: TCauses = {};

	get causes() { return this._causes; }

	flags: number = 0;

	canCast() { return (this.flags & StatusFlags.nospells) === 0 }
	canAttack() { return (this.flags & StatusFlags.noattack) === 0 }
	canDefend() { return (this.flags & StatusFlags.nodefend) === 0 }

	/// flag - state flag
	has(flag: number) {
		return (this._causes[flag]?.length ?? 0) > 0;
	}

	constructor() {
	}

	/**
	 * Pick new target based on char state.
	 * e.g. confused, charmed, etc.
	 * @param targFlags - original target
	 */
	retarget(targFlags: TargetFlags) {

		if ((this.flags & StatusFlags.confused) > 0) {

			return targFlags ? ConfuseTargets[targFlags] ?? 0 : TargetFlags.random;

		} else if ((this.flags & StatusFlags.charmed) > 0) {

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