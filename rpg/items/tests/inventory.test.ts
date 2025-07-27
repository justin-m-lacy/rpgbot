import { Inventory, IsInventory } from "rpg/items/inventory";
import { Item } from "rpg/items/item";
import { ReviveItem } from "rpg/parsers/items";

describe('Inventory tests', async () => {

	it('Create Inventory. Add/Remove items.', async () => {

		const inv = new Inventory({ id: 'myInv' });

		expect(IsInventory(inv)).toBe(true);

		const it = new Item({ id: 'item1', name: 'my item', desc: 'nothing' });
		inv.add(it);

		expect(inv.size).toBe(1);
		expect(inv.items[0]).toBe(it);

		inv.take('item1');
		expect(inv.size).toBe(0);



	});

	it('Encodes/Decodes to same value.', async () => {

		const inv = new Inventory({ id: 'myInv' });
		inv.add(new Item({ id: 'item1', name: 'my item', desc: 'nothing' }));

		const inv2 = Inventory.Revive(JSON.parse(JSON.stringify(inv)), ReviveItem);

		expect(inv2).toEqual(inv);

	});


});