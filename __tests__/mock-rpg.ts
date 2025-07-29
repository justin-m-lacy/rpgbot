import { Rpg } from "rpg/rpg";


export const MockRpg = () => {

	vi.mock('rpg/rpg', () => {

		const Rpg = vi.fn();

		return {
			Rpg
		}

	});

	return (new (Rpg as any)()) as Rpg;

}