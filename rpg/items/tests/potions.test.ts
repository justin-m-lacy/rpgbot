import { Potion } from "rpg/items/potion";
import { ItemType } from "rpg/items/types";
import { GenPotion, InitPotions } from "rpg/parsers/potions";

describe('Potions', async () => {

	beforeAll(async () => {
		await InitPotions();
	});

	it('Gen potion from id.', async () => {

		const p = GenPotion('pot_poison1')!;
		expect(p).toBeDefined();
		expect(p.type).toBe(ItemType.Potion);

	});

	it('Encodes/Decodes to same value', async () => {

		const p = GenPotion('pot_poison1')!;
		const p2 = Potion.Decode(JSON.parse(JSON.stringify(p)));

		expect(p2).toEqual(p);

	});

});