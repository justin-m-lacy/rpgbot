import { InitGame } from 'rpg/init';
import { Weapon } from 'rpg/items/weapon';
import { ReviveChar } from '../rpg/parsers/revive-char';
import CharData from './data/chars/joetest.json';
import { GetTestGame } from './init';


describe('Revive Character File', () => {

	beforeAll(async () => {
		await InitGame();
	});

	const game = GetTestGame();

	afterAll(() => {
		game.stop();
	});

	it('Should parse character file.', () => {

		// Parse the JSON data
		const char = ReviveChar(game, CharData);

		// Assertions
		expect(char.name).toBe('joetest');

		const weap = char.getEquip('right') as Weapon;

		expect(weap).toBeTypeOf('object');
		expect(weap.material).toBeTypeOf('object');

		expect(weap.name).toBe('iron spear');

		//expect(char.attacks.length).toBe(1);
		//expect(char.minions[0].name).toBe('rat');


	});

	it('Should encode then decode correctly', () => {

		const char1 = ReviveChar(game, CharData);

		const char2 = ReviveChar(game, JSON.parse(JSON.stringify(char1)));
		expect(char2).toEqual(char1);

		const char3 = ReviveChar(game, JSON.parse(JSON.stringify(char2)));
		//expect(char3).toEqual(char2);
	});

});