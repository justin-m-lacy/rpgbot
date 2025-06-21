import { ParseValues } from 'rpg/parsers/values';
import { AddPath } from 'rpg/values/apply';
import type { IMod } from 'rpg/values/imod';
import { ApplyMods, RemoveMods } from 'rpg/values/modding';
import type { Path } from 'rpg/values/paths';
import { Actor } from '../char/actor';
import { Char } from '../char/char';
import { ParseMods } from '../parsers/mods';
import { type TValue } from '../values/types';

type RawEffect = {
	id: string,
	name?: string,
	dot?: Record<string, any>,
	time?: number
} &
	typeof import('../data/magic/effects.json', { assert: { type: 'json' } })[number];

// effect types. loading at bottom.
const effects: { [name: string]: ProtoEffect } = {};

/**
 * Effect info only. Effect is effect in progress.
 */
export class ProtoEffect {

	get time() { return this._time; }
	set time(v) { this._time = v; }

	readonly id: string;
	readonly name: string;
	readonly mods: Path<IMod> | null;
	readonly dot: Path<TValue> | null;
	private _time: any;

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

		this._time = data.time ?? 0;

	}

	toJSON() {

		return {
			mods: this.mods,
			dot: this.dot,			// formulas have toJSON()?
			time: this._time
		};

	}

}

export class Effect {

	get name() { return this._effect.name; }

	get effect() { return this._effect; }
	get dot() { return this._effect.dot; }

	get mods() { return this._effect.mods }

	get time() { return this._time; }

	private _effect: ProtoEffect;
	private _time: number;
	// source that created the effect.
	private readonly source?: string;

	static Revive(json: any) {

		let e = json.effect;
		if (typeof (e) === 'string') e = effects[e];
		else e = new ProtoEffect(e);
		if (!e) return null;

		return new Effect(e, json.src, json.time);
	}

	toJSON() {

		return {
			src: this.source,
			effect: this._effect.name,
			time: this._time
		};

	}

	constructor(effect: ProtoEffect, time?: number, src?: any) {

		this._effect = effect;
		this.source = src;
		this._time = time || this._effect.time;

	}

	start(char: Actor) {

		if (char instanceof Char) {
			char.log(`${char.name} is affected by ${this.name}.`);
		}

		if (this.mods) {
			ApplyMods(char, this.mods);
		};

	}

	end(char: Char) {

		char.log(`${char.name}: ${this.name} has worn off.`);
		if (this.mods) {
			RemoveMods(char, this.mods);
		};

	}

	/**
	 * 
	 * @param char
	 * @returns {bool} true if effect complete. 
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

const parseEffect = (raw: RawEffect) => {

	return new ProtoEffect({
		id: raw.id,
		name: raw.name,
		mods: raw.mods ? ParseMods(raw.mods, raw.id,) : null,
		dot: raw.dot ? ParseValues(raw.id, 'dot', raw.dot) : null,
		time: raw.time,
	});


}

export const LoadEffects = async () => {

	const efx = (await import('../data/magic/effects.json', { assert: { type: 'json' } })).default;
	for (let i = efx.length - 1; i >= 0; i--) {
		effects[efx[i].id] = parseEffect(efx[i] as any);
	}

}


export const GetEffect = (s: string) => effects[s];