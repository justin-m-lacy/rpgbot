import { randomUUID } from 'crypto';
import { TActor } from 'rpg/char/mobs';
import { StatusFlag } from 'rpg/char/states';
import { Game } from 'rpg/game';
import { ParseValues } from 'rpg/parsers/values';
import { AddValues } from 'rpg/values/apply';
import type { IMod } from 'rpg/values/imod';
import { ApplyMods, RemoveMods } from 'rpg/values/modding';
import type { Path } from 'rpg/values/paths';
import { ParseMods } from '../parsers/mods.js';
import { type TValue } from '../values/types.js';

export type RawEffect = {
	id: string,
	name?: string;
	desc?: string;

	/// damage type.
	type?: string;
	dot?: Record<string, RawEffect>,
	mod?: Record<string, string | number>,
	add?: Record<string, string | number>,
	stack?: number,
	duration?: number,
	time?: number
}

// effect types. loading at bottom.
const DotTypes: { [name: string]: ProtoDot } = {};

/**
 * Effect prototype. class Effect is effect in progress.
 */
export class ProtoDot {

	readonly id: string;
	readonly name: string;
	readonly desc?: string;
	readonly mod?: Path<IMod> | undefined;
	readonly add?: Path<TValue> | undefined;
	readonly duration: number;

	// kind of damage.
	readonly kind: string;

	/**
	 * Number of times effect can stack.
	 */
	readonly stack: number;


	/**
	 * status to apply with effect.
	 */
	readonly flags: StatusFlag;

	constructor(data: {
		id: string,
		name?: string,
		mod?: Path<IMod>,
		add?: Path<TValue>,
		duration?: number,
		flags?: StatusFlag;
		stack?: number,
		kind?: string
	}) {

		this.id = data.id;
		this.name = data.name ?? data.id;
		this.add = data.add;
		this.mod = data.mod;

		this.kind = data.kind ?? 'unknown';

		this.stack = data.stack ?? 0;
		this.flags = data.flags ?? StatusFlag.none;

		this.duration = data.duration ?? 0;

	}

	toJSON() {

		return {
			mod: this.mod,
			dot: this.add,			// formulas have toJSON()?
			time: this.duration
		};

	}

}

/**
 * Active dot.
 */
export class Dot {

	static Decode(json: any) {

		if (json == null || typeof json !== 'object') {
			// don't throw for just a missing effect.
			console.warn(`missing effect data: ${json}`);
			return null;
		}

		let e = json.efx ?? json.dot;
		if (typeof (e) === 'string') e = DotTypes[e];
		else if (e && typeof e === 'object') e = new ProtoDot(e);
		if (!e) return null;

		return new Dot(e, json.src, json.time);

	}

	toJSON() {

		return {
			src: this.maker,
			dot: this.proto ? this.proto?.id : undefined,
			time: this.time
		};

	}

	readonly id: string;

	readonly name: string;

	// template for effect.
	readonly proto?: ProtoDot;

	private time: number;

	readonly mod: Path<IMod> | null;
	readonly add: Path<TValue> | null;

	duration: number;

	// spell, npc, or action that created the effect.
	readonly maker?: string;

	flags: StatusFlag;

	constructor(proto?: ProtoDot, maker?: string, time?: number) {

		this.id = proto?.id ?? randomUUID();

		this.name = proto?.name ?? 'unknown';
		this.flags = proto?.flags ?? 0;

		this.mod = proto?.mod ?? null;
		this.add = proto?.add ?? null;

		this.duration = proto?.duration ?? 0;

		this.proto = proto;
		this.maker = maker;
		this.time = time ?? this.proto?.duration ?? 10;

	}

	start<T extends TActor>(char: T) {

		char.log(`${char.name} is affected by ${this.name}.`);

		if (this.mod) {
			ApplyMods(char, this.mod);
		};

	}

	end<T extends TActor>(char: T) {

		char.log(`${char.name}: ${this.name} has worn off.`);
		if (this.mod) {
			RemoveMods(char, this.mod);
		};

	}

	/**
	 * @param char - char to tick. Char must be alive.
	 * @returns true if effect complete. 
	 */
	tick<T extends TActor>(char: T, game: Game) {

		if (this.add) {

			AddValues(char, this.add, 1);
			if (!char.isAlive()) {
				game.events.emit('charDie', char, this.maker ?? this.id);
			} else {
				char.log(`${char.name} affected by ${this.name}.`);
			}

		}

		if (!this.duration) return false;

		this.time--;
		return (this.time <= 0);

	}

}

export const ParseDotProto = (raw: RawEffect, parent?: { id: string, name?: string }) => {

	return new ProtoDot({
		id: raw.id ?? parent?.id,
		name: raw.name ?? parent?.name,
		mod: raw.mod ? ParseMods(raw.mod, raw.id,) : undefined,
		add: raw.dot ? ParseValues(raw.id, 'dot', raw.dot) : undefined,
		duration: raw.time,
	});


}

export const GetOrParseDots = (arr: Array<string | RawEffect>): undefined | ProtoDot[] => {

	if (!Array.isArray(arr) || !arr.length) {
		return undefined;
	}

	const res: ProtoDot[] = [];

	for (let i = 0; i < arr.length; i++) {

		if (typeof arr[i] === 'string') {
			const d = DotTypes[arr[i] as string];
			if (d) res.push(d);

		} else {

			const d = ParseDotProto(arr[i] as any);
			if (d) res.push(d);

		}

	}

	return res;

}

export const LoadDotTypes = async () => {

	const efx = (await import('data/magic/dots.json', { assert: { type: 'json' } })).default;
	for (let i = efx.length - 1; i >= 0; i--) {
		DotTypes[efx[i].id] = ParseDotProto(efx[i] as any);
	}

}


export const GetDot = (s: string) => DotTypes[s];