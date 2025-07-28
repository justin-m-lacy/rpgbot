import { TActor } from 'rpg/char/mobs';
import { TestRequire, type RawIf, type TRequire } from 'rpg/effects/requires.js';
import { ParseResult, type RawResult, type Result } from 'rpg/effects/results.js';
import { Char } from '../char/char.js';


const effects: Record<string, Effect> = {};

export class Effect {

	toJSON() { return this; }

	readonly id: string;
	readonly name: string;
	readonly result: Result<TActor>[];

	private err?: string;

	private need?: TRequire<Char> = undefined;

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
	apply(char: TActor) {

		if (this.need && !TestRequire(char, this.need)) {

			if (this.err) char.log(this.err);
			return false;

		}

		if (this.result) {

			const len = this.result.length;
			for (let i = 0; i < len; i++) {

				const res = this.result[i];
				if (res.apply(char)) {

					if (res.fb) {
						char.log(res.fb);
					}
				} else {

					if (res.err) {
						char.log(res.err);
					}
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