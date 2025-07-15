import { randElm } from '@/utils/jsutils';
import FoodInfo from 'data/cooking.json';
import type { Char } from 'rpg/char/char';
import { type Game } from 'rpg/game';
import { Item } from 'rpg/items/item';
import { ItemType } from 'rpg/items/types';

const GetAdjective = () => {
	return randElm(FoodInfo.adjectives);
}


export const Cook = {

	id: 'cook',
	name: 'cooking',
	stats: [],
	exec(_: Game, char: Char, what: string | number | Item) {

		let item = what instanceof Item ? what : char.inv.get(what);
		if (!item) return 'Item not found.';

		if (item.type === ItemType.Food) return item.name + ' is already food.';

		char.addHistory('cook');
		CookItem(item);
		return `${char.name} cooks '${item.name}'`;

	}

}

export const TryEat = (char: Char, it: Item) => {

	if (it.type !== ItemType.Food) {
		char.log(it.name + ' isn\'t food!');
		return false;
	}

	char.addHistory('eat');

	let resp = FoodInfo.response[Math.floor(
		FoodInfo.response.length * Math.random())
	];

	const amt = char.heal(
		Math.floor(5 * Math.random()) + char.level.valueOf());

	resp = `You eat the ${it.name}. ${resp}.`;
	if (amt > 0) resp += ` ${amt} hp healed. ${char.hp.valueOf()}/${char.hp.max.valueOf()} total.`;

	char.log(resp);

	return true;

}

const CookItem = (it: Item) => {

	const cooking = require('data/cooking.json');
	const adjs = cooking.adjectives;

	const adj = adjs[Math.floor(adjs.length * Math.random())];

	if ('armor' in it) {
		// @ts-ignore
		it.armor -= 10;
	} else if ('bonus' in it) {
		// @ts-ignore
		it.bonus -= 10;
	}
	it.type = ItemType.Food;

	it.name = adj + ' ' + it.name;

	const desc = cooking.descs[Math.floor(cooking.descs.length * Math.random())];
	it.desc += ' ' + desc;

}