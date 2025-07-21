import { InitGame } from "rpg/init";
import { GetMaterial } from "rpg/items/material";

describe('Game Materials', async () => {

	beforeAll(async () => {
		await InitGame();
	});


	test('Base materials should exist', async () => {

		const mat = GetMaterial('iron');
		expect(mat).toBeDefined();
		expect(mat.name).toBe('iron');

	});
});