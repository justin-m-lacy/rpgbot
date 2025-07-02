import { Id } from "rpg/values/types";

export class BadTypeError extends Error {

	constructor(got?: any, expectType?: string) {

		super(`Bad Data Format:\nExpected: ${expectType} got: ${got}`);

	}

}

export class NullDataError extends Error {
	constructor() {
		super('Data null or undefined');
	}
}

export class InvalidParam extends Error {
	constructor(got?: any) {
		super(`Invalid parameter. Got: ${got}`);
	}

}

export class NotEnoughArgs extends Error {
	constructor(cmd: string, got: number, expected: number) {
		super(`${cmd}: Too few args: Expected: ${expected}, got ${got}`);
	}
}

export class NaNError extends Error {

	readonly value: unknown;
	readonly source?: Id;

	constructor(v: unknown, source?: Id) {
		super(`${source?.toString()}: Value is NaN: ${v}`);
		this.value = v;
		this.source = source;
	}

}