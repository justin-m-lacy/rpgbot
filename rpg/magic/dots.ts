import { TActor } from 'rpg/char/mobs';
import { StatusFlag } from 'rpg/char/states';
import { Game } from 'rpg/game';
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
	dot?: Record<string, RawEffect>,
	time?: number
} &
	typeof import('data/magic/dots.json',
	{ assert: { type: 'json' } })[number];

// effect types. loading at bottom.
const DotTypes: { [name: string]: ProtoDot } = {};

/**
 * Effect prototype. class Effect is effect in progress.
 */
export class ProtoDot {

	readonly id: string;
	readonly name: string;
	readonly desc?: string;
	readonly mods: Path<IMod> | null;
	readonly add: Path<TValue> | null;
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
		mods?: Path<IMod> | null,
		add?: Path<TValue> | null,
		duration?: number,
		flags?: StatusFlag;
		stack?: number,
		kind?: string
	}) {

		this.id = data.id;
		this.name = data.name ?? data.id;
		this.add = data.add ?? null;
		this.mods = data.mods ?? null;

		this.kind = data.kind ?? 'unknown';

		this.stack = data.stack ?? 0;
		this.flags = data.flags ?? StatusFlag.none;

		this.duration = data.duration ?? 0;

	}

	toJSON() {

		return {
			mods: this.mods,
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

		let e = json.efx;
		if (typeof (e) === 'string') e = DotTypes[e];
		else if (e && typeof e === 'object') e = new ProtoDot(e);
		if (!e) return null;

		return new Dot(e, json.src, json.time);

	}

	toJSON() {

		return {
			src: this.maker,
			efx: this.proto.id,
			time: this._time
		};

	}

	get flags() { return this.proto.flags }

	get name() { return this.proto.name; }

	get dot() { return this.proto.add; }

	get mod() { return this.proto.mods }

	get time() { return this._time; }

	get id() { return this.proto.id }

	// template for effect.
	readonly proto: ProtoDot;

	private _time: number;

	// spell, npc, or action that created the effect.
	readonly maker?: string;


	constructor(proto: ProtoDot, maker?: string, time?: number) {

		this.proto = proto;
		this.maker = maker;
		this._time = time || this.proto.duration;

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

		if (!this.proto.duration) return false;

		this._time--;

		if (this.dot) {

			AddValues(char, this.dot, 1);
			if (!char.isAlive()) {

				if (this.maker) {
					game.loadChar(this.maker).then((slayer) => {
						game.events.emit('charDie', char, slayer ?? this.name);
					})
				} else {
					game.events.emit('charDie', char, this.name);
				}

			} else {
				char.log(`${char.name} affected by ${this.name}.`);
			}

		}

		return (this._time <= 0);

	}

}

export const ParseDotType = (raw: RawEffect, parent?: { id: string, name?: string }) => {

	return new ProtoDot({
		id: raw.id ?? parent?.id,
		name: raw.name ?? parent?.name,
		mods: raw.mods ? ParseMods(raw.mods, raw.id,) : null,
		add: raw.dot ? ParseValues(raw.id, 'dot', raw.dot) : null,
		duration: raw.time,
	});


}

export const LoadDotTypes = async () => {

	const efx = (await import('data/magic/dots.json', { assert: { type: 'json' } })).default;
	for (let i = efx.length - 1; i >= 0; i--) {
		DotTypes[efx[i].id] = ParseDotType(efx[i] as any);
	}

}


export const GetDot = (s: string) => DotTypes[s];