import { CanMod } from "rpg/values/imod";
import { IsValue } from "rpg/values/types";



export const HasJSON = (obj: any): obj is { toJSON(): any } => {
	return obj && typeof obj === 'object' && typeof obj.toJSON === 'function';
}


export const EncodeInst = (obj: Record<string, any>, template: Record<string, any>) => {

	const out: Record<string, any> = {}
	for (const k in obj) {

		if (obj[k] === template[k]) continue;
		out[k] = EncodeVar(obj[k], template[k]);
	}

	return out;

}

/**
 * Encode single variable value.
 * @param val 
 * @param orig 
 * @returns 
 */
export const EncodeVar = (val: unknown, orig?: any): any => {

	if (val === undefined || val === null || val === '') return undefined;

	if (typeof val !== 'object') {

		if (typeof val === 'symbol' || typeof val === 'function') return undefined;
		if (orig === val) return undefined;
		if (val === 0 && orig == null) return undefined;

		return val;

	} else {


		// recursive encode unknown?
		const v = HasJSON(val) ? val.toJSON() :
			(CanMod(val) ? val.base :
				(IsValue(val) ? val.value : undefined)
			);

		return TrimObj(v, orig);

	}

}


/**
 * Trims null, undefined, and zero values from encoded object,
 * and skips encode if no key values remain.
 * @param obj 
 * @param src 
 */
const TrimObj = (obj: any, src: any) => {

	if (!obj || obj == src) return undefined;
	else if (typeof obj !== 'object' || !src) {

		if (obj === 0 && (src === null || src === undefined)) return undefined;
		if (IsValue(src) && obj == src.value) return undefined;
		// don't return encoding value if value is same as default.
		return obj == src ? undefined : obj;

	}

	let hasKeys = false;

	for (const k in obj) {
		if (obj[k] = TrimObj(obj[k], src[k])) {
			hasKeys = true;
		}
	}

	return hasKeys ? obj : undefined;

}
