import { GenFeature, InitFeatures, ReviveFeature } from "rpg/builders/features";

describe('Feature tests', async () => {

	beforeAll(() => {
		InitFeatures();
	});

	test('Generate, store, and revive shrine', async () => {

		const f1 = await GenFeature('shrine');

		expect(f1).toBeDefined();

		const f2 = ReviveFeature(
			JSON.parse(JSON.stringify(f1))
		);

		expect(f2).toEqual(f1);


	});

	test('Generate, store, and revive Gate', async () => {

		const f1 = await GenFeature('gate');

		expect(f1).toBeDefined();

		const f2 = ReviveFeature(
			JSON.parse(JSON.stringify(f1))
		);

		expect(f2).toEqual(f1);


	});
});