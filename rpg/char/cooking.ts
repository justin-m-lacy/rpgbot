import { randElm } from '@/utils/jsutils';
import type { Char } from 'rpg/char/char';
import { type Item } from 'rpg/items/item';
import { ItemType } from 'rpg/parsers/items';
import FoodInfo from '../data/cooking.json';

export const GetAdjective = () => {
	return randElm(FoodInfo.adjectives);
}

const LoadFoods = async () => {

	const Raws = (await import('../data/cooking.json', { assert: { type: 'json' } })).default;

}

export const TryEat = (char: Char, it: Item) => {

	if (it.type !== ItemType.Food) {
		char.log(it.name + ' isn\'t food!');
		return false;
	}

	const cook = require('../data/cooking.json');
	char.addHistory('eat');

	let resp = cook.response[Math.floor(cook.response.length * Math.random())];

	const amt = char.heal(
		Math.floor(5 * Math.random()) + char.level.valueOf());

	resp = `You eat the ${it.name}. ${resp}.`;
	if (amt > 0) resp += ` ${amt} hp healed. ${char.hp.valueOf()}/${char.hp.max.valueOf()} total.`;

	char.log(resp);

	return true;

}