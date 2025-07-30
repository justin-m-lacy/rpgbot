import { TActor } from 'rpg/char/mobs';
import { type RawIf } from 'rpg/effects/requires.js';
import { ParseResult, type RawResult, type Result } from 'rpg/effects/results.js';
import type { Char } from '../char/char.js';
import type { Game } from '../game';


const effects: Record<string, Effect> = {};

export class Effect {

	toJSON() { return this; }

	readonly id: string;
	readonly name: string;
	readonly result: Result<TActor>[];

	constructor(id: string, name?: string) {

		this.id = id;
		this.name = name ?? id;
		this.result = [];

	}

	/**
	 * Apply action to target.
	 * @param char 
	 * @returns 
	 */
	apply(game: Game, char: TActor) {

		const len = this.result.length;
		for (let i = 0; i < len; i++) {

			const res = this.result[i];
			if (res.apply(game, char)) {

				if (res.fb) {
					char.log(res.fb);
				}
			} else {

				if (res.err) {
					char.log(res.err);
				}
			}

		}

		return true;


	}



}

type RawAction = {
	id: string,
	name?: string,
	require?: RawIf,
	result?: RawResult[]

}

const ParseAction = (data: RawAction) => {

	if (!data.id) return undefined;

	const a = new Effect(data.id, data.name);

	if (data.result) {
		a.result.push(...data.result.map(ParseResult<Char>));
	}

	return a;

}

export const LoadActions = async () => {

	const data = (await import('data/magic/effects.json', { assert: { type: 'json' } })).default;

	let k: keyof typeof data;
	for (k in data) {
		const a = ParseAction(data[k] as any);
		if (a) effects[a.id] = a;
	}
}

export const ParseEffect = (s: string | string[]) => {

	if (typeof s == 'string') s = s.split(',');
	if (s.length == 0) return undefined;
	if (s.length == 1) return effects[s[0]];
	return s.map(p => effects[p]);

}