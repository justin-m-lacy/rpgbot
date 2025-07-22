import { InitGame } from "rpg/init";
import { ICache } from "rpg/util/icache";
import { World } from "rpg/world/world";

type MockCache<T = any> = ICache<T> & { vars: Record<string, any> };

describe('Game World', async () => {

	const Cache = vi.fn(function <T>(this: MockCache<T>): ICache<any> {
		this.vars = {};
		return this;
	});
	Cache.prototype.subcache = vi.fn(
		function (this: typeof Cache) { return this }
	);
	Cache.prototype.cache = Cache.prototype.store = vi.fn(
		function (this: MockCache, key: string, val: any) {
			this.vars[key] = val;
		});

	Cache.prototype.get = vi.fn(function (this: MockCache<any>, key: string) {
		return this.vars[key];
	});

	Cache.prototype.fetch = vi.fn(
		async function (this: MockCache<any>, key: string) {
			return this.vars[key];
		}
	);

	beforeAll(async () => {
		await InitGame();
	});

	afterAll(() => {
		vi.resetAllMocks();
	});

	test('Generate new world.', async () => {

		const world = new World(new Cache(),
			new Cache());

		await world.init();

		const loc = world.getLoc({ x: 0, y: 0 });
		expect(loc).toBeDefined();

		expect(loc?.features.length).toBeGreaterThanOrEqual(2);


	});

});