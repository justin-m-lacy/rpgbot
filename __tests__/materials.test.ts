import { GetMaterial, LoadMaterials } from "rpg/items/material";

describe('Game Materials', async () => {

	it('Correctly parses Materials data.', async () => {

		const mats = await LoadMaterials();
		expect(mats.length).toBeGreaterThan(1);

	});

	it('Base materials should exist.', async () => {

		const mat = GetMaterial('iron');
		expect(mat).toBeDefined();
		expect(mat.name).toBe('iron');

		const silk = GetMaterial('silk');
		expect(silk.alter.tohit).toBeDefined();
		expect(silk.alter.price).toBeDefined();
		expect(silk.alter.dmg).toBeDefined();



	});
});