export type TRequire = Record<string, any>;


export type RawRequire = Record<string, any>;

export type RawResult = {
	require?: RawRequire,
	apply?: Record<string, any>,
	fb?: string,
	err?: string
}

export type TResult = {

}

export const ParseResult = (raw: RawResult) => {


	return {

		fb: raw.fb,
		err: raw.err
	}

}

export class Result {

	err?: string;
	fb?: string;
	apply?: any;
	require?: TRequire;

	constructor(require?: any, apply?: any, fb?: string, err?: string) {

		this.require = require;
		this.apply = apply;
		this.fb = fb;
		this.err = err;

	}

}