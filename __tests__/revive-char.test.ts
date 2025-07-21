import { InitGame } from 'rpg/rpg';
import { ReviveChar } from '../rpg/parsers/revive-char';
import CharData from './data/chars/joetest.json';
import { TestGame } from './init';


describe('Revive Character File', () => {

	beforeAll(async () => {
		await InitGame();
		console.log(`game data loaded`);
	});

	afterAll(() => {
		TestGame.stop();
	});

	it('Should parse character file.', async () => {

		// Parse the JSON data
		const char = ReviveChar(TestGame, CharData);

		// Assertions
		expect(char.name).toBe('joetest');
	});
});