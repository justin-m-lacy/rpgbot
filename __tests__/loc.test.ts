import { Loc } from "rpg/world/loc";
import LocData from "./data/loc/loc5,2.json";

describe('Location tests', async () => {

	test('Revive Location from JSON', async () => {

		const loc = Loc.Revive(LocData);
		expect(Object.keys(loc.exits).length).toBe(4);
		expect(loc.inv.size).toBe(4);
		expect(loc.features.length).toBe(2);

		expect(loc.coord).toEqual({ x: 5, y: 2 })

	});
});