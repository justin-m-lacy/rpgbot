import { Dice, IsDiceRoll } from "rpg/values/dice";
import { ParsePaths } from "rpg/values/paths";
import { IsPercentData, ParsePercent } from "rpg/values/percent";
import { IsRangeData, Range } from "rpg/values/range";
import { Setter } from "rpg/values/setter";
import { Simple } from "rpg/values/simple";
import type { TValue } from "rpg/values/types";
import { JoinPath } from '../values/paths';

/// IdTest - Test for a simple id name.
const IdTest = /^[A-Za-z_]+\w*$/;

const IsSetterData = (str: string) => {
	return str.startsWith('=:');
}

/**
 * 
 * @param id - if of base object.
 * @param subId - id of values subobject.
 * @param obj 
 */
export const ParseValues = (id: string, subId: string, obj: Record<string, any>) => {

	return ParsePaths(obj, subId, (path, orig) => {
		return ParseValue(JoinPath(id, path), orig);
	});

}

/**
 * Attempt to parse a simple number or value.
 * @param id 
 * @param v 
 * @returns 
 */
export const ParseValue = (id: string, v?: string | number | object): TValue | undefined => {

	if (typeof v === 'number') return new Simple(id, v);

	if (typeof v === 'string') {

		if (IsDiceRoll(v)) return Dice.Parse(v);
		if (IsRangeData(v)) return new Range(v, id);
		if (IsPercentData(v)) return ParsePercent(v, id);
		//if (IsPctValue(v)) return ParsePctValue(v, id);

		//if (IsSetterData(v)) return ParseSetter(id, v);

		return undefined;
	}
	return undefined;

}


/**
 * Return a number or TValue, using number if possible.
 * @param id 
 * @param v 
 */
export const ParseNum = (id: string, v: string | number | object): TValue | number | undefined => {

	if (typeof v === 'number') return v;
	return ParseValue(id, v);
}

export const ParseSetter = (id: string, str: string) => {

	// slice start chars.
	const v = ParseValue(id, str.slice(2));
	return v ? new Setter(id, v) : undefined;

}