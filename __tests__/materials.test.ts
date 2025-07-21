import { InitGame } from "rpg/init";
import { GetMaterial } from "rpg/items/material";

beforeAll(async () => {
	await InitGame();
});

describe('Game Materials', async () => {

	test('Base materials should exist', async () => {

		const mat = GetMaterial('iron');
		expect(mat).toBeDefined();
		expect(mat.name).toBe('iron');

	});
});