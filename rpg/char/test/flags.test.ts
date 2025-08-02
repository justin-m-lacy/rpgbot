import { ParseStateFlags, StatusFlag } from "rpg/char/states";

describe('Status Flags Tests', () => {


	it('Parse status from string', () => {

		const flags = ParseStateFlags('confused,nospells,incorp');

		expect(flags & StatusFlag.confused).toBeGreaterThan(0);
		expect(flags & StatusFlag.nospells).toBeGreaterThan(0);
		expect(flags & StatusFlag.incorp).toBeGreaterThan(0);

		expect(flags & StatusFlag.dead).toBe(0);
		expect(flags & StatusFlag.charmed).toBe(0);
		expect(flags & StatusFlag.noattack).toBe(0);

	});


});