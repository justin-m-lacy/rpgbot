import { IsValue, type Numeric } from "rpg/values/types";

export const AddValues = (dest: Record<string, any>, vals: Record<string, Numeric>) => {

	for (let k in vals) {

		const targ = dest[k];
		if (!targ || typeof targ === 'number') {

			dest[k] = +vals[k];

		} else if (IsValue(targ)) {
			targ.value += +vals[k];
		}

	}

}