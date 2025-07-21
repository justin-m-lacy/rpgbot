import { GetProto } from "rpg/builders/itemgen";
import { InitGame } from "rpg/init";
import { GetMaterial } from "rpg/items/material";
import { Weapon } from "rpg/items/weapon";
import { RawWeaponData } from "rpg/parsers/weapon";

beforeAll(async () => {
	await InitGame();
});

describe('Game Weapons', async () => {

	test('Spawn weapon from proto', async () => {

		const proto = GetProto<RawWeaponData>('staff');
		const mat = GetMaterial('steel');

		expect(proto).toBeDefined();
		expect(mat).toBeDefined();

		const w = Weapon.FromProto(proto, mat);
		expect(w.name).toBe('steel staff');

		expect(w.dmg.roll()).toBeLessThanOrEqual(6);
		expect(w.dmg.roll()).toBeGreaterThanOrEqual(1);

	});
});