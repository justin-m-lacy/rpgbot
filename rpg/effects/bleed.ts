import { Dot, ParseDotProto } from "rpg/effects/dots";
import { TValue } from "rpg/values/types";

export const MakeBleed = (amt: number | TValue, time: number = 10, maker?: string) => {

	const d = new Dot(ParseDotProto({
		id: 'bleed', name: 'Bleed', duration: time, stack: 1,
		add: {
			"hp": -amt
		}
	}), maker);
}