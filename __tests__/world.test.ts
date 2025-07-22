import { InitGame } from "rpg/init";
import { GetMaterial } from "rpg/items/material";

beforeAll(async () => {
	await InitGame();
});

describe('Game World', async () => {

	test('Reload world with location', async () => {

		const mat = GetMaterial('iron');
		expect(mat).toBeDefined();
		expect(mat.name).toBe('iron');

	});
});