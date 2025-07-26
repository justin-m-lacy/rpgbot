import { ParseValue } from "rpg/parsers/values";
import { Percent } from "rpg/values/percent";

describe('Percent tests', async () => {

	it('Encodes/Decodes to same value', () => {

		const p1 = new Percent('pct', 77);
		const p2 = ParseValue('pct', JSON.parse(JSON.stringify(p1)));

		expect(p1).toEqual(p2);

	});

});