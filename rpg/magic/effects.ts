import { StatusFlags } from 'rpg/char/states';
import { Npc } from 'rpg/monster/monster';
import { ParseValues } from 'rpg/parsers/values';
import { AddValues } from 'rpg/values/apply';
import type { IMod } from 'rpg/values/imod';
import { ApplyMods, RemoveMods } from 'rpg/values/modding';
import type { Path } from 'rpg/values/paths';
import { ParseMods } from '../parsers/mods';
import { type TValue } from '../values/types';

export type RawEffect = {
	id: string,
	name?: string;
	desc?: string;

	/// damage type.
	type?: string;
	dot?: Record<string, any>,
	time?: number
} &
	typeof import('../data/magic/dots.json', { assert: { type: 'json' } })[number];

// effect types. loading at bottom.
export const Effects: { [name: string]: ProtoEffect } = {};

/**
 * Effect prototype. class Effect is effect in progress.
 */
export class ProtoEffect {

	readonly id: string;
	readonly name: string;
	readonly desc?: string;
	readonly mods: Path<IMod> | null;
	readonly dot: Path<TValue> | null;
	readonly time: number;

	// kind of damage.
	readonly kind: string;

	/**
	 * Number of times effect can stack.
	 */
	readonly stack: number;


	/**
	 * status to apply with effect.
	 */
	readonly flags: StatusFlags;

	constructor(data: {
		id: string,
		name?: string,
		mods?: Path<IMod> | null,
		dot?: Path<TValue> | null,
		time?: number,
		flags?: StatusFlags;
		stack?: number,
		kind?: string
	}) {

		this.id = data.id;
		this.name = data.name ?? data.id;
		this.dot = data.dot ?? null;
		this.mods = data.mods ?? null;

		this.kind = data.kind ?? 'unknown';

		this.stack = data.stack ?? 0;
		this.flags = data.flags ?? StatusFlags.none;

		this.time = data.time ?? 0;

	}

	toJSON() {

		return {
			mods: this.mods,
			dot: this.dot,			// formulas have toJSON()?
			time: this.time
		};

	}

}

export class Effect {

	static Decode(json: any) {

		if (json == null || typeof json !== 'object') {
			// don't throw for just a missing effect.
			console.warn(`missing effect data: ${json}`);
			return null;
		}

		let e = json.efx;
		if (typeof (e) === 'string') e = Effects[e];
		else if (e && typeof e === 'object') e = new ProtoEffect(e);
		if (!e) return null;

		return new Effect(e, json.src, json.time);

	}

	toJSON() {

		return {
			src: this.source,
			efx: this.proto.id,
			time: this._time
		};

	}

	get flags() { return this.proto.flags }

	get name() { return this.proto.name; }

	get dot() { return this.proto.dot; }

	get mod() { return this.proto.mods }

	get time() { return this._time; }

	get id() { return this.proto.id }

	// template for effect.
	readonly proto: ProtoEffect;

	private _time: number;

	// spell, npc, or action that created the effect.
	readonly source?: string;


	constructor(effect: ProtoEffect, time?: number, src?: any) {

		this.proto = effect;
		this.source = src;
		this._time = time || this.proto.time;

	}

	start<T extends Npc>(char: T) {

		char.log(`${char.name} is affected by ${this.name}.`);

		if (this.mod) {
			ApplyMods(char, this.mod);
		};

	}

	end<T extends Npc>(char: T) {

		char.log(`${char.name}: ${this.name} has worn off.`);
		if (this.mod) {
			RemoveMods(char, this.mod);
		};

	}

	/**
	 * @param char
	 * @returns true if effect complete. 
	 */
	tick<T extends Npc>(char: T) {

		if (!this.proto.time) return false;

		this._time--;

		if (this.dot) {

			AddValues(char, this.dot, 1);
			char.log(`${char.name} affected by ${this.name}.`);


		}

		return (this._time <= 0);

	}

}

export const ParseDotType = (raw: RawEffect) => {

	return new ProtoEffect({
		id: raw.id,
		name: raw.name,
		mods: raw.mods ? ParseMods(raw.mods, raw.id,) : null,
		dot: raw.dot ? ParseValues(raw.id, 'dot', raw.dot) : null,
		time: raw.time,
	});


}

export const LoadDotTypes = async () => {

	const efx = (await import('../data/magic/dots.json', { assert: { type: 'json' } })).default;
	for (let i = efx.length - 1; i >= 0; i--) {
		Effects[efx[i].id] = ParseDotType(efx[i] as any);
	}

}


export const GetDot = (s: string) => Effects[s];