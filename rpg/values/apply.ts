import { IsPath, type Path } from "rpg/values/paths";
import { Simple } from "rpg/values/simple";
import { IsSimple, IsValue, type Numeric, type TValue } from "rpg/values/types";

export const SetValues = (targ: any & object, apply: Path<TValue>) => {


	for (const k in apply) {

		const subVal = apply[k];

		if (IsPath(subVal)) {

			if (!targ[k]) {
				SetValues(targ[k] = {}, subVal);
			} else if (typeof targ[k] === 'object') {
				SetValues(targ[k], subVal);
			}

		} else {
			targ[k] = subVal.value;
		}


	}

}

export const AddValues = (dest: Record<string, any>, vals: Record<string, Numeric>) => {

	for (let k in vals) {

		if (!IsValue(vals[k])) {
			dest[k] = vals[k];
			continue;
		}

		const targ = dest[k];
		if (!targ || typeof targ === 'number') {

			dest[k] = +vals[k];

		} else if (IsValue(targ)) {
			targ.value += +vals[k];
		}

	}

}

/**
 * Test if object has minimum amount of values.
 * Usually used to test if a quantity of item can be spent.
 * @param dest 
 * @param costs 
 * @param dt - scale factor of cost values.
 * @returns 
 */
export const HasValues = (dest: Record<string, any>,
	costs: Path<Numeric | TValue>,
	dt: number = 1) => {

	for (const key in costs) {

		const amt = costs[key];
		const targ = costs.getKeyed(dest, key);
		if (!targ) return false;

		if (IsPath(amt)) {

			if (!HasValues(targ ?? createValue(dest, key, targ), amt, dt)) {
				return false;
			}

		} else if (IsValue(amt) || typeof amt === 'number') {

			const tot = dt * Number(amt);
			if (IsValue(targ)) {
				if (targ.valueOf() < tot) return false;
			} else if (typeof targ === 'number') {
				if (targ < tot) return false;
			}

		} else if (typeof amt === 'object') {

		}

	}
	return true;

}

/**
 * For each [path,value] in list, add value amount, multiplied by factor dt
 * @param dest 
 * @param rlist - path of result values to add to dest.
 * @param dt - added value multiplier. usually timestep.
 * @param ctx - source of rlist. useful for debugging or special triggers.
 */
export const AddPath = (
	dest: Record<string, any>,
	rlist: Path<Numeric | TValue>,
	dt: number,
) => {

	for (const key in rlist) {

		const amt = rlist[key];
		const targ = rlist.getKeyed(dest, key);

		if (IsPath(amt)) {

			AddPath(targ ?? createValue(dest, key, targ), amt, dt);

		} else if (IsValue(amt) || typeof amt === 'number') {

			const tot = dt * Number(amt);
			if (targ === null || typeof targ !== 'object') {
				promoteToValue(dest, key, tot);
			}
			/// Can't value += tot on a composite object like TagSet.
			else if (IsSimple(targ)) targ.add(tot);
			else if (IsValue(targ)) targ.value += tot;

		} else if (typeof amt === 'object') {

		}

	}
}


/// Create an object at key for holding stats/data, etc.
/// parent[key] is assumed to not exist, or not be an object.
const createValue = (dest: any & object, key: string, cur?: any) => {
	if (!cur || typeof cur === 'number') {
		return dest[key] = new Simple(key, cur ?? 0);
	} else if (typeof cur === 'string') {
		const v = parseInt(cur)
		return new Simple(key, Number.isNaN(v) ? 0 : v);
	}
	return dest[key] = new Simple(key, 0);
}


/**
 * Attempt to promote a non-object property into a simple.
 * @param dest 
 * @param key 
 * @param cur 
 * @returns 
 */
const promoteToValue = (dest: any & object, key: string, cur: any) => {

	const prop = Object.getOwnPropertyDescriptor(dest, key);
	if (prop && (prop.set || prop.get)) {
		/// propery is already a getter/setter. can't alter.
		dest[key] = cur;
		return cur;
	} else if (typeof cur === 'number' || !cur) {
		return dest[key] = new Simple(key, cur ?? 0);
	} else if (typeof cur === 'string') {
		const v = parseInt(cur)
		return new Simple(key, Number.isNaN(v) ? 0 : v);
	}
	return new Simple(key);

}

