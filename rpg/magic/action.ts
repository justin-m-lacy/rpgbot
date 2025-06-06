import { TestRequire, type TRequire } from 'rpg/handlers/requires';
import { ParseResult, type RawIf, type RawResult, type Result } from 'rpg/handlers/results';
import { Char } from '../char/char';
import * as dice from '../values/dice';

type RawAction = {
	id: string,
	name?: string,
	require?: RawIf,
	result?: RawResult[]

}

const actions: Record<string, Action> = {};

class Action {

	static Revive(json: RawAction & object) {

		const a = new Action(json.id, json.name);

		if (json.result) {
			a.result = json.result.map(ParseResult);
		}

		return Object.assign(a, json);

	}

	toJSON() { return this; }

	readonly id: string;
	private readonly name: string;
	private result?: Result[];

	private err?: string;

	private need?: TRequire<Char>;

	constructor(id: string, name?: string) {

		this.id = id;
		this.name = name ?? id;

	}

	/**
	 * Apply action to target.
	 * @param char 
	 * @returns 
	 */
	apply(char: Char) {

		if (this.need && !TestRequire(char, this.need)) {
			return false;
		}

		// effects with different conditions for each one.
		if (this.result) {

			const len = this.result.length;
			for (let i = 0; i < len; i++) {

				const e = this.result[i];
				if (TestRequire(char, e.need)) {
					return this.applyResult(char, e);
				}
				if (e.err) return e.err.replace('%c', char.name);
			}

		} else {

			if (TestRequire(char, this.need)) {
				//return this.applyResult(char, this);
			}

		}

		if (this.err) return this.err.replace('%c', char.name);
	}

	applyResult(char: Char, res: Result) {

		const apply = res.apply;
		for (const k in apply) {

			const val = apply[k];
			if (typeof (val) === 'object') {

				// @ts-ignore
				if (val.roll) char[k] += dice.parseRoll(val.roll);

			} else {
				// @ts-ignore
				char[k] = val;
			}


		}

		if (res.fb) return res.fb.replace('%c', char.name);
		return '';

	}

}

export const LoadActions = async () => {

	const data = (await import('../data/magic/actions.json')).default;

	let k: keyof typeof data;
	for (k in data) {
		actions[k] = Action.Revive(data[k]);
	}
}

export const GetAction = (s: string) => {
	return actions[s];
}