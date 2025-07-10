import { TestRequire, type RawIf, type TRequire } from 'rpg/magic/requires';
import { ParseResult, type RawResult, type Result } from 'rpg/magic/results';
import { TActor } from 'rpg/monster/mobs';
import { Char } from '../char/char';


const actions: Record<string, Action> = {};

export class Action {

	toJSON() { return this; }

	readonly id: string;
	readonly name: string;
	readonly result: Result<TActor>[];

	private err?: string;

	private need?: TRequire<Char>;

	constructor(id: string, name?: string) {

		this.id = id;
		this.name = name ?? id;
		this.result = [];

		console.log(`parse action: ${this.id}`);
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
					console.log(`success: ${this.id}`);
					// any feedback.
					if (res.fb) {
						char.log(res.fb);
					}
				} else {
					/// feedback.
					console.log(`fail: ${this.id}`);
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

	const a = new Action(data.id, data.name);

	if (data.result) {
		a.result.concat(...data.result.map(ParseResult<Char>));
	}

	return a;

}

export const LoadActions = async () => {

	const data = (await import('../data/magic/actions.json', { assert: { type: 'json' } })).default;

	let k: keyof typeof data;
	for (k in data) {
		const a = ParseAction(data[k] as any);
		if (a) actions[a.id] = a;
	}
}

export const GetAction = (s: string) => {
	return actions[s];
}