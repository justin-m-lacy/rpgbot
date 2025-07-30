import { Percent } from "rpg/values/percent";

export type RawIf = Record<string, any>;

export type TestFunc<T extends object> = (targ: T) => boolean;

export type TRequire<T extends object> = TestFunc<T> | Record<string, any>;

export const TestRequire = <T extends object>(targ: T, req: TRequire<T>) => {

	if (typeof req === 'function') return req(targ);
	else if (Array.isArray(req)) {
		for (let i = 0; i < req.length; i++) {
			if (!TestRequire(targ, req[i])) return false;
		}
		return true;
	} else {
		for (const k in req) {
			if ((targ as any)[k] != req[k]) return false;
		}
		return true;
	}

}


export class TestEqual<T extends any = any> {

	vals: Record<string, any>;

	constructor(vals: Record<string, any>) {
		this.vals = vals;
	}

	test(targ: T) {

		for (const k in this.vals) {
			if (targ[k as keyof T] != this.vals[k]) return false;
		}
		return true;


	}

}


export class TestPct {

	pct: Percent;

	constructor(pct: Percent) {
		this.pct = pct;
	}

	test(_: any) {
		return this.pct.value > 0;
	}

}