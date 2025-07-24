import { BaseMod } from "rpg/values/mods/base-mod";
import { Percent } from "rpg/values/percent";
import { Range } from "rpg/values/range";
import { Simple } from "rpg/values/simple";

describe('Base mod tests', async () => {

	test('Apply base mod to Simple.', async () => {

		const s = new Simple('simp', 3);
		const mod = new BaseMod('base', 4);

		s.addMod(mod);
		expect(s.value).toBe(7);

	});

	it('Apply base mod to Range.', async () => {

		const s = new Range({ min: 2, max: 7 }, 'rangeVal');
		const mod = new BaseMod('base', 4);

		s.addMod(mod);
		expect(s.min.valueOf()).toBe(6);
		expect(s.max.valueOf()).toBe(11);

	});

	it('Apply base mod to Percent.', async () => {

		const s = new Percent('pct', 50);
		const mod = new BaseMod('mod1', 0.2);

		expect(s.pct).toBe(0.5);

		s.addMod(mod);

		expect(s.pct.valueOf()).toBe(0.7);

		s.addMod(new BaseMod('mod2', -0.4));
		expect(s.pct.valueOf()).equal(0.3);

	});

});