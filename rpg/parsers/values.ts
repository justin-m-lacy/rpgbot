import { ParsePaths } from "rpg/values/paths";
import { IsPercentData, ParsePercent } from "rpg/values/percent";
import { IsRangeData, Range } from "rpg/values/range";
import { Simple } from "rpg/values/simple";
import type { TValue } from "rpg/values/types";
import { JoinPath } from '../values/paths';

/// IdTest - Test for a simple id name.
const IdTest = /^[A-Za-z_]+\w*$/;


/**
 * 
 * @param id - if of base object.
 * @param subId - id of values subobject.
 * @param obj 
 */
export const ParseValues = (id: string, subId: string, obj: Record<string, any>) => {

	return ParsePaths(obj, subId, (path, orig) => {
		return ParseValue(JoinPath(id, path), orig)
	});

}

/**
 * Attempt to parse a simple value.
 * @param id 
 * @param v 
 * @returns 
 */
export const ParseValue = (id: string, v?: string | number | object): TValue | undefined => {

	if (typeof v === 'number') return new Simple(id, v);

	if (typeof v === 'string') {

		if (IsPercentData(v)) return ParsePercent(v, id);
		//if (IsPctValue(v)) return ParsePctValue(v, id);
		if (IsRangeData(v)) return new Range(v, id);

		return undefined;
	}
	return undefined;

}
