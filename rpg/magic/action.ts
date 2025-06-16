import { TestRequire, type RawIf, type TRequire } from 'rpg/handlers/requires';
import { ParseResult, type RawResult, type Result } from 'rpg/handlers/results';
import { Char } from '../char/char';

const actions: Record<string, Action> = {};

class Action {

	toJSON() { return this; }

	readonly id: string;
	readonly name: string;
	readonly result: Result<Char>[];

	private err?: string;

	private need?: TRequire<Char>;

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
	apply(char: Char) {

		if (this.need && !TestRequire(char, this.need)) {

			if (this.err) char.log(this.err);
			return false;

		}

		// effects with different conditions for each one.
		if (this.result) {

			const len = this.result.length;
			for (let i = 0; i < len; i++) {

				const res = this.result[i];
				if (res.if && !TestRequire(char, res.if)) {
					if (res.err) char.log(res.err);

				}
				if (res.apply(char)) {
					// any feedback.
					if (res.fb) {
						char.log(res.fb);
					}
				} else {
					/// feedback.
					if (res.err) {
						char.log(res.err);
					}
				}

			}

		} else {

		}


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

	const a = new Action(data.id, data.name);

	if (data.result) {
		a.result.concat(...data.result.map(ParseResult<Char>));
	}

	return a;

}

export const LoadActions = async () => {

	const data = (await import('../data/magic/actions.json')).default;

	let k: keyof typeof data;
	for (k in data) {
		const a = ParseAction(data[k] as any);
		if (a) actions[a.id] = a;
	}
}

export const GetAction = (s: string) => {
	return actions[s];
}