import { BaseMod } from "rpg/values/mods/base-mod";
import { Range } from "rpg/values/range";
import { Simple } from "rpg/values/simple";

describe('Base mod tests', async () => {

	test('Apply base mod to Simple.', async () => {

		const s = new Simple('simp', 3);
		const mod = new BaseMod('base', 4);

		s.addMod(mod);
		expect(s.value).toBe(7);

	});

	test('Apply base mod to Range.', async () => {

		const s = new Range({ min: 2, max: 7 }, 'rangeVal');
		const mod = new BaseMod('base', 4);

		s.addMod(mod);
		expect(s.min.valueOf()).toBe(6);
		expect(s.max.valueOf()).toBe(11);

	});

});