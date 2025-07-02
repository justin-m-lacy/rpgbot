import { ParseValues } from 'rpg/parsers/values';
import { AddPath } from 'rpg/values/apply';
import type { IMod } from 'rpg/values/imod';
import { ApplyMods, RemoveMods } from 'rpg/values/modding';
import type { Path } from 'rpg/values/paths';
import { Actor } from '../char/actor';
import { Char } from '../char/char';
import { ParseMods } from '../parsers/mods';
import { type TValue } from '../values/types';

export type RawEffect = {
	id: string,
	name?: string,
	dot?: Record<string, any>,
	time?: number
} &
	typeof import('../data/magic/effects.json', { assert: { type: 'json' } })[number];

// effect types. loading at bottom.
export const Effects: { [name: string]: ProtoEffect } = {};

/**
 * Effect prototype. class Effect is effect in progress.
 */
export class ProtoEffect {

	readonly id: string;
	readonly name: string;
	readonly mods: Path<IMod> | null;
	readonly dot: Path<TValue> | null;
	readonly time: number;

	constructor(data: {
		id: string,
		name?: string,
		mods?: Path<IMod> | null,
		dot?: Path<TValue> | null,
		time?: number
	}) {

		this.id = data.id;
		this.name = data.name ?? data.id;
		this.dot = data.dot ?? null;
		this.mods = data.mods ?? null;

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

	get name() { return this.efx.name; }

	get effect() { return this.efx; }
	get dot() { return this.efx.dot; }

	get mod() { return this.efx.mods }

	get time() { return this._time; }

	// source effect.
	private readonly efx: ProtoEffect;

	private _time: number;

	// spell, npc, or action that created the effect.
	private readonly source?: string;

	static Revive(json: any) {

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
			efx: this.efx.id,
			time: this._time
		};

	}

	constructor(effect: ProtoEffect, time?: number, src?: any) {

		this.efx = effect;
		this.source = src;
		this._time = time || this.efx.time;

	}

	start(char: Actor) {

		if (char instanceof Char) {
			char.log(`${char.name} is affected by ${this.name}.`);
		}

		if (this.mod) {
			ApplyMods(char, this.mod);
		};

	}

	end(char: Char) {

		char.log(`${char.name}: ${this.name} has worn off.`);
		if (this.mod) {
			RemoveMods(char, this.mod);
		};

	}

	/**
	 * 
	 * @param char
	 * @returns true if effect complete. 
	 */
	tick(char: Char) {

		if (!this._time) return false;

		this._time--;

		const v = this.dot;
		if (v) {

			let s = `${char.name} affected by ${this.name}.`;

			AddPath(char, v, 1);

			/// TODO: logging for dot?
			/*let len = v.setProps.size;
			if (len > 0) {

				s += ' ( ';
				for (const k of v.setProps.keys()) {
					if (--len > 0) s += `${k}: ${char[k as keyof Char]}, `;
					else s += `${k}: ${char[k as keyof Char]}`;
				}
				s += ' )';

			}*/

			char.log(s);


		}

		return (this._time <= 0);

	}

}

const parseEffectType = (raw: RawEffect) => {

	return new ProtoEffect({
		id: raw.id,
		name: raw.name,
		mods: raw.mods ? ParseMods(raw.mods, raw.id,) : null,
		dot: raw.dot ? ParseValues(raw.id, 'dot', raw.dot) : null,
		time: raw.time,
	});


}

export const LoadEffectTypes = async () => {

	const efx = (await import('../data/magic/effects.json', { assert: { type: 'json' } })).default;
	for (let i = efx.length - 1; i >= 0; i--) {
		Effects[efx[i].id] = parseEffectType(efx[i] as any);
	}

}


export const GetEffect = (s: string) => Effects[s];