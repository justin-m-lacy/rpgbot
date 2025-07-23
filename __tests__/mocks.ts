


/*jest.mock('@/game', () => {

	(Game as jest.Mock).mockImplementation(() => {

		return {

		}

	});

});*/

import { ICache } from "rpg/util/icache";
export type MockCache<T = any> = ICache<T> & { vars: Record<string, any> };
export const MockCache = <T extends any>() => {

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

	return Cache;

}
