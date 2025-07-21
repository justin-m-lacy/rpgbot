import { InitGame } from 'rpg/init';
import { Weapon } from 'rpg/items/weapon';
import { ReviveChar } from '../rpg/parsers/revive-char';
import CharData from './data/chars/joetest.json';
import { TestGame } from './init';

beforeAll(async () => {
	await InitGame();
});


describe('Revive Character File', () => {

	const game = TestGame();

	afterAll(() => {
		game.stop();
	});

	it('Should parse character file.', async () => {

		// Parse the JSON data
		const char = ReviveChar(game, CharData);

		// Assertions
		expect(char.name).toBe('joetest');

		const weap = char.getEquip('right') as Weapon;

		expect(weap).toBeTypeOf('object');
		expect(weap.material).not.null;

		expect(weap.material).toBeTypeOf('object');

		expect(weap.name).toBe('iron spear');
		expect(char.attacks.length).toBe(1);

	});
});