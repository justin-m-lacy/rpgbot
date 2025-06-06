import { TestEqual, type TRequire } from "rpg/handlers/requires";

export type RawIf = Record<string, any>;
export type RawResult = {
	require?: RawIf,
	set?: Record<string, any>,
	fb?: string,
	err?: string
}

export type TIf = Record<string, any>;

type BaseResult = {
	// condition for result to apply.
	if?: TIf,
	fb?: string,
	err?: string
}

export type TResult = {

	if?: TIf,
	set?: Record<string, any>,
	fb?: string,
	err?: string,
	apply: <T extends object>(targ: T) => boolean | undefined;

}

export const ParseResult = (raw: RawResult) => {


	return {

		fb: raw.fb,
		err: raw.err
	}

}

export class Result<T extends object> {

	err?: string;
	fb?: string;
	need?: TRequire<T>;
	set?: Record<string, any>

	constructor(require?: any, apply?: any, fb?: string, err?: string) {

		this.need = require;
		this.apply = apply;
		this.fb = fb;
		this.err = err;

	}

	apply(targ: T) {

		if (this.need) {

			if (typeof this.need === 'function') {

				if (!this.need(targ)) {
					return false;
				}

			} else if (!TestEqual(targ, this.need)) {

			}

		}

		if (this.set) {
			for (const k in this.set) {
				(targ as any)[k] = this.set[k];
			}
		}


	}

}