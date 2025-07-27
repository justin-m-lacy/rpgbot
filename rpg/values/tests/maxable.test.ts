import { Maxable } from "rpg/values/maxable";

describe('Maxable tests', async () => {

	it('Encodes/Decodes to same value', () => {

		const m1 = new Maxable('m1');
		m1.setMax(14);
		m1.value = 10;

		const m2 = new Maxable('m2');
		m2.setTo(JSON.parse(JSON.stringify(m1)));

		expect(m2).toEqual(m1);

	});

	it('Clamps values to Max', () => {

		const m1 = new Maxable('m1');
		m1.setMax(14);
		m1.value = 20;

		expect(m1.max.value).toEqual(14);
		expect(m1.value).toEqual(m1.max.value);

		m1.value = 3;
		expect(m1.value).toEqual(3);

	});

	it('Can call add()', () => {

		const m1 = new Maxable('m1');
		m1.setMax(14);

		m1.value = 3;
		m1.add(4);

		expect(m1.value).toEqual(7);

		m1.add(82);
		expect(m1.max.value).toEqual(14);
		expect(m1.value).toEqual(m1.max.value);

	});

});