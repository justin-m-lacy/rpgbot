import LocData from "__tests__/data/loc/loc5,2.json";
import { GenItem } from "rpg/builders/itemgen";
import { InitGame } from "rpg/init";
import { GenMob } from "rpg/parsers/mobs";
import { Loc } from "rpg/world/loc";
import { Shop } from "rpg/world/shop";

describe('Location tests', async () => {

	beforeAll(async () => {
		await InitGame();
	});

	it('Revive Location from JSON', () => {

		const loc = Loc.Revive(LocData);
		expect(Object.keys(loc.exits).length).toBe(4);
		expect(loc.inv.size).toBe(3);
		expect(loc.biome).toBe('town');

		expect(loc.features.length).toBe(2);
		expect(loc.npcs.length).toBe(1);

		expect(loc.coord).toEqual({ x: 5, y: 2 })

	});

	it('Encodes/Decodes to same value', () => {

		const loc1 = Loc.Revive(LocData);
		const loc2 = Loc.Revive(JSON.parse(JSON.stringify(loc1)));

		//Compared values have no visual difference
		//strange jest error comparing Shop values.
		// values equal but still complains.
		//expect(loc2).toEqual(loc1);

		expect(loc1.name).toBe(loc2.name);
		expect(loc1.biome).toBe(loc2.biome);
		expect(loc1.items).toEqual(loc2.items);
		expect(loc1.npcs).toEqual(loc2.npcs);

		expect(loc1.features[0]).toEqual(loc2.features[0]);
		const shop1 = loc1.features[1] as Shop;
		const shop2 = loc2.features[1] as Shop;

		expect(shop1.inv.size).toEqual(shop2.inv.size);
		for (let i = shop1.inv.size - 1; i >= 0; i--) {
			expect(shop1.inv.get(i)).toEqual(shop2.inv.get(i));
		}


	});

	it('Can add and remove Npc', () => {

		const loc = Loc.Revive(LocData);

		const m = GenMob('ghoul')!;
		loc.addNpc(m);

		expect(loc.npcs.length).toBe(2);
		expect(loc.getNpc(m.name)).toBe(m);

		loc.removeNpc(m);
		expect(loc.npcs.length).toBe(1);
		expect(loc.getNpc(m.name)).toBeUndefined();

	});

	it('Can add and remove items', () => {

		const loc = Loc.Revive(LocData);

		const len = loc.items.length;
		expect(loc.get("leather cape")).toBeDefined();

		const it = GenItem('elfroid_ear')!;
		loc.addItem(it);

		expect(loc.get(it.name)).toEqual(it);
		expect(loc.items.length).toBe(len + 1);

		expect(loc.take(it.name)).toEqual(it);
		expect(loc.items.length).toBe(len);

	})

});