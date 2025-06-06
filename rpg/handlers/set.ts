import { IsPath, type Path } from "rpg/values/paths";
import type { Setter } from "rpg/values/setter";

export const SetValues = (targ: any & object, apply: Path<Setter>) => {


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