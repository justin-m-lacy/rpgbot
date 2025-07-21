import { readFileSync } from 'fs';
import * as path from 'path';
import { InitGame } from 'rpg/rpg';
import { ReviveChar } from '../rpg/parsers/revive-char';
import { TestGame } from './init';

beforeAll(async () => {
	await InitGame();
	console.log(`game data loaded`);
});

describe('Revive Character File', () => {

	it('Should parse character file.', () => {
		// Load the JSON file
		const jsonFilePath = path.join(__dirname, 'data/chars/joetest.json');
		console.log(`file path: ${jsonFilePath}`);

		const jsonData = readFileSync(jsonFilePath, 'utf-8');

		// Parse the JSON data
		const char = ReviveChar(TestGame, null);

		// Assertions
		expect(char).toEqual({
			name: 'joetest'
		});
		expect(char.name).toBe('joetest');
	});
});