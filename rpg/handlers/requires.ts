import type { TIf } from "rpg/handlers/results";


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

/**
 * Test if requirement is met.
 * @param targ 
 * @param req 
 * @returns 
 */
export const TestEqual = (targ: Record<string, any>, req?: TIf) => {

	if (!req) return true;

	if (typeof req == 'object') {

		for (const k in req) {
			if (targ[k] != req[k]) return false;
		}
		return true;

	}

}