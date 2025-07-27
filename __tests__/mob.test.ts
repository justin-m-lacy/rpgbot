import { ReviveMob } from "rpg/parsers/mobs";
import Kobold from "./data/mobs/kobold.json";

describe('Mob tests', async () => {

	test('Revive Mob from JSON', async () => {

		const mob = ReviveMob(Kobold)!;

		expect(mob.proto?.id).toBe('kobold');
		expect(mob.name).toBe('kobold');
		expect(mob.tohit.valueOf()).toBe(1);
		expect(mob.armor.valueOf()).toBe(1);

	});
});