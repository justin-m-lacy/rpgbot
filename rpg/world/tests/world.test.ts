import { MockCache } from "__tests__/mock-cache";
import { MockGame } from "__tests__/mock-game";
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
		const world = new World(MockGame(), new Cache(), new Cache());

		await world.init();

		const loc = world.getLoc({ x: 0, y: 0 });
		expect(loc).toBeDefined();
		expect(loc?.features.length).toBeGreaterThanOrEqual(2);
		expect(Object.keys(loc!.exits).length).toBeGreaterThan(1);


	});

	it('Can generate new locations', async () => {

		const Cache = MockCache();
		const world = new World(MockGame(), new Cache(), new Cache());

		const loc = await world.getOrGen({ x: 3, y: -2 });
		expect(loc).toBeDefined();
		expect(loc.coord.equals({ x: 3, y: -2 }));

	});

});