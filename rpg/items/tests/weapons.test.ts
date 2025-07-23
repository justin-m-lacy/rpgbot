import { GetProto } from "rpg/builders/itemgen";
import { InitGame } from "rpg/init";
import { GetMaterial } from "rpg/items/material";
import { Weapon } from "rpg/items/weapon";
import { ReviveWeapon } from "rpg/parsers/armor";
import { RawWeaponData } from "rpg/parsers/weapon";

describe('Game Weapons', async () => {

	beforeAll(async () => {
		await InitGame();
	});

	it('Spawns weapon from proto', async () => {

		const proto = GetProto<RawWeaponData>('staff');
		const mat = GetMaterial('steel');

		expect(proto).toBeDefined();
		expect(mat).toBeDefined();

		const w = Weapon.FromProto(proto, mat);
		expect(w.name.toLowerCase()).toBe('steel staff');

		expect(w.dmg.roll()).toBeLessThanOrEqual(9);
		expect(w.dmg.roll()).toBeGreaterThanOrEqual(4);

	});

	it('Revives weapon from json', async () => {

		const proto = GetProto<RawWeaponData>('shortsword');
		const mat = GetMaterial('bone');
		const w1 = Weapon.FromProto(proto, mat);

		console.dir(JSON.stringify(w1));

		expect(w1.name.toLowerCase()).toBe('bone short sword');

		const data = JSON.stringify(w1);
		const w2 = ReviveWeapon(JSON.parse(data));

		expect(w1).toEqual(w2);

	});
});