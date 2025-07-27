import { BaseMod } from "rpg/values/mods/base-mod";
import { Percent } from "rpg/values/percent";
import { Range } from "rpg/values/range";
import { Simple } from "rpg/values/simple";

describe('Base mod tests', async () => {

	test('Add/Remove mod to Simple.', async () => {

		const s = new Simple('s', 3);
		const mod = new BaseMod('base', 4);

		s.addMod(mod);
		expect(s.value).toBe(7);

		s.removeMod(mod);
		expect(s.value).toEqual(3);

	});

	it('Apply base mod to Range.', async () => {

		const s = new Range({ min: 2, max: 7 }, 'r');
		const mod1 = new BaseMod('base', 4);

		s.addMod(mod1);
		expect(s.min.valueOf()).toBe(6);
		expect(s.max.valueOf()).toBe(11);

		const mod2 = new BaseMod('base', 3);
		s.addMod(mod2);
		expect(s.min.valueOf()).toBe(9);
		expect(s.max.valueOf()).toBe(14);

		s.removeMod(mod1);
		expect(s.min.valueOf()).toBe(2);
		expect(s.max.valueOf()).toBe(7);


	});

	it('Apply/Remove mods to Percent.', async () => {

		const s = new Percent('pct', 50);
		expect(s.pct).toBe(0.5);

		const mod1 = new BaseMod('mod1', 0.3);
		s.addMod(mod1);

		expect(s.pct.valueOf()).toBe(0.8);

		s.addMod(new BaseMod('mod2', -0.2));
		expect(s.pct.valueOf()).equal(0.6);

		// remove mod1
		s.removeMod(mod1);
		expect(s.pct.valueOf()).eq(0.3)

	});

	test('Does not alter Simple Encode/Decode', async () => {

		const s1 = new Simple('simp', 3);
		const mod = new BaseMod('base', 4);
		s1.addMod(mod);

		const s2 = new Simple('s2', JSON.parse(JSON.stringify(s1)));
		expect(s2.value).toEqual(3);
		s2.addMod(mod);
		expect(s2.value).toEqual(7);

	});

});