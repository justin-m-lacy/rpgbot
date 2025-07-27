import { Dice } from "rpg/values/dice";

describe('Dice tests', async () => {

	it('Should encode and decode correctly.', async () => {

		let d1 = new Dice(3, 7, -5);
		let d2 = Dice.Decode(JSON.parse(JSON.stringify(d1)));

		expect(d2.sides).toBe(7);
		expect(d2).toEqual(d1);

		d1 = new Dice(-3, 4, 7);
		d2 = Dice.Decode(JSON.parse(JSON.stringify(d1)));

		expect(d2).toEqual(d1);

		d1 = new Dice(2, -23, 54);
		d2 = Dice.Decode(JSON.parse(JSON.stringify(d1)));

		expect(d2).toEqual(d1);

	});

	it('', async () => {


	});

});