import { MockCache } from "__tests__/mocks";
import { InitGame } from "rpg/init";
import { World } from "rpg/world/world";

describe('Game World', async () => {

	beforeAll(async () => {
		await InitGame();
	});

	afterAll(() => {
		vi.resetAllMocks();
	});

	test('Generate new world.', async () => {

		const Cache = MockCache();

		const world = new World(new Cache(), new Cache());

		await world.init();

		const loc = world.getLoc({ x: 0, y: 0 });
		expect(loc).toBeDefined();
		expect(loc?.features.length).toBeGreaterThanOrEqual(2);
		expect(Object.keys(loc!.exits).length).toBeGreaterThan(1);


	});

});