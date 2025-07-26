import { ParseValue } from "rpg/parsers/values";
import { Range } from "rpg/values/range";

describe('Range value tests', async () => {

	it('Encodes/Decodes to same value', () => {

		const r1 = new Range({ min: -3, max: 4 }, 'var');
		const r2 = ParseValue('var', JSON.parse(JSON.stringify(r1)));

		expect(r1).toEqual(r2);

	});

	it('Correctly parses positives and negatives', () => {

		const r1 = ParseValue('r1', "5~10");
		expect(r1?.value).toBeTypeOf('number');
		expect(ParseValue('r1', JSON.parse(JSON.stringify(r1)))).toEqual(r1);

		const r2 = ParseValue('r2', "-7~-10");
		expect(r2?.value).toBeTypeOf('number');
		expect(ParseValue('r2', JSON.parse(JSON.stringify(r2)))).toEqual(r2);

		const r3 = ParseValue('r3', "-7.4~12.5");
		expect(r3?.value).toBeTypeOf('number');
		expect(ParseValue('r3', JSON.parse(JSON.stringify(r3)))).toEqual(r3);

		const r4 = ParseValue('r4', "18~-20.5");
		expect(r4?.value).toBeTypeOf('number');
		expect(ParseValue('r4', JSON.parse(JSON.stringify(r4)))).toEqual(r4);

	});

});