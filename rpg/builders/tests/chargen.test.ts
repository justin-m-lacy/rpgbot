import { GetTestGame } from '__tests__/mock-game';
import { GenChar } from 'rpg/builders/chargen';
import { InitGame } from 'rpg/init';
import { GetClass, GetRace } from 'rpg/parsers/parse-class';

describe('Generate New Char', () => {

	beforeAll(async () => {
		await InitGame();
	});

	afterAll(() => {
	});

	it('Should Generate new Character', () => {

		const game = GetTestGame();
		const race = GetRace('elf')!;
		const cls = GetClass('warrior')!;

		const char = GenChar({ game, name: 'Mockee', sex: 'f', owner: 'mockowner', race: race, cls: cls });

		expect(char).toBeDefined();
		expect(char.name).toBe('Mockee');
		expect(char.sex).toBe('f');
		expect(char.owner).toBe('mockowner')

		expect(char.race).toBe(race);
		expect(char.gclass).toBe(cls);

		for (const k in char.stats) {
			expect(char.stats[k]).toBeGreaterThanOrEqual(3);
		}

	});

});