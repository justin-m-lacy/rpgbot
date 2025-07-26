import LocData from "__tests__/data/loc/loc5,2.json";
import { GenItem } from "rpg/builders/itemgen";
import { GenMob } from "rpg/parsers/mobs";
import { Loc } from "rpg/world/loc";

describe('Location tests', async () => {

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

		const loc = Loc.Revive(LocData);
		const loc2 = Loc.Revive(JSON.parse(JSON.stringify(loc)));
		expect(loc2).toEqual(loc);

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

		expect(loc.get('elfroid_ear')).toEqual(it);
		expect(loc.items.length).toBe(len + 1);

		expect(loc.take('elfroid_ear')).toEqual(it);
		expect(loc.items.length).toBe(len);

	})

});