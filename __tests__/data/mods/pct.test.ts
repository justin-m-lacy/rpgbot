import { PctMod } from "rpg/values/mods/pct-mod";
import { Range } from "rpg/values/range";
import { Simple } from "rpg/values/simple";

describe('Pct mod tests', async () => {

	test('Apply pct mod to Simple.', async () => {

		const s = new Simple('simp', 3);
		const mod = new PctMod('pct', { bonus: 0, pct: 0.5 });

		s.addMod(mod);
		expect(s.value).toBe(4.5);

	});

	test('Apply pct mod to Range.', async () => {

		const s = new Range({ min: 2, max: 7 }, 'rangeVal');
		const mod = new PctMod('pct', { bonus: 0, pct: 0.5 });

		s.addMod(mod);
		expect(s.min.valueOf()).toBe(3);
		expect(s.max.valueOf()).toBe(10.5);

	});

});