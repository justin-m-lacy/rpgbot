export class BadDataError extends Error {

	constructor(got?: any, expectType?: string) {

		super(`Bad Data Format:\nExpected: ${expectType} got: ${got}`);

	}

}

export class NullDataError extends Error {
	constructor() {
		super('Data null or undefined');
	}
}