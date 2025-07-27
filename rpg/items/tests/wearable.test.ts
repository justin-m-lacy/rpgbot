import { GetProto } from "rpg/builders/itemgen";
import { InitGame } from "rpg/init";
import { GetMaterial } from "rpg/items/material";
import { Wearable } from "rpg/items/wearable";
import { RawWearableData, ReviveWearable } from "rpg/parsers/armor";

describe('Game Armor', async () => {

	beforeAll(async () => {
		await InitGame();
	});

	it('Spawns armor from proto', async () => {

		const proto = GetProto<RawWearableData>('boots');
		const mat = GetMaterial('leather');

		expect(proto).toBeDefined();
		expect(mat).toBeDefined();

		const w = Wearable.FromProto(proto, mat);
		expect(w.name.toLowerCase()).toBe('leather boots');

	});

	it('Revives armor from json', async () => {

		const proto = GetProto<RawWearableData>('helm');
		const mat = GetMaterial('iron');
		const w1 = Wearable.FromProto(proto, mat);

		expect(w1.name.toLowerCase()).toBe('iron helm');

		const data = JSON.stringify(w1);
		const w2 = ReviveWearable(JSON.parse(data));

		expect(w2).toEqual(w1);

	});


});