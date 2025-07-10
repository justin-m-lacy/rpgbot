import * as jsutils from '@/utils/jsutils';
import type { ItemIndex } from 'rpg/items/container';
import { GenArmor } from 'rpg/parsers/armor';
import { GenWeapon } from 'rpg/parsers/weapon';
import { Char } from "./char/char";
import { ItemPicker } from './inventory';
import { Item } from './items/item';
import { GetMaterial } from "./items/material";
import { Wearable, toSlot } from './items/wearable';

/**
 * @const {RegExp} isGold - Regexp testing for a gold amount.
 */
const goldAmt = /^(\d+)\s*g(?:old)?$/i;

/**
 *
 * @param lvl
 * @returns item cost per level.
 */
const rollPrice = (lvl: number) => {
	return 40 * lvl * (Math.floor(Math.pow(1.5, Math.floor(lvl / 2))));
}

/**
 * Removes a gold amount or returns false.
 * @param amt
 */
export const PayOrFail = (char: Char, gold: number) => {

	if (gold > char.gold) return false;
	char.gold -= gold;
	return true;

}

export const rollWeap = (char: Char) => {

	let level = char.level.valueOf();
	const price = rollPrice(level);
	if (!PayOrFail(char, price))
		return `${char.name} cannot afford to roll a new weapon. (${price} gold)`;

	const mod = Math.max(1 + char.getModifier('cha'), 0);

	level = Math.max(0, level + jsutils.random(-1, mod));
	const it = GenWeapon(level);

	if (!it) return 'Failed to roll a weapon.';

	const ind = char.addItem(it);
	return `${char.name} rolled a shiny new ${it.name}. (${ind})`;

}

export const rollArmor = (char: Char, slot?: string | null) => {

	let level = char.level.valueOf();
	const price = rollPrice(level);
	if (!PayOrFail(char, price))
		return `${char.name} cannot afford to roll new armor. (${price} gold)`;

	const mod = Math.max(1 + char.getModifier('cha'), 0);

	level = Math.max(0, level + jsutils.random(-1, mod));
	const it = GenArmor(level, toSlot(slot));

	if (!it) return 'Failed to roll armor.';

	const ind = char.addItem(it);

	return `${char.name} rolled a spiffy new ${it.name}. (${ind})`;

}

export const sellRange = (src: Char, start: ItemIndex, end: ItemIndex) => {

	const arr = src.takeRange(start, end);
	if (arr === null) return 'Invalid item range.';
	if (arr.length === 0) return 'No items in range.';

	const mod = Math.max(src.level.valueOf() + src.getModifier('cha'), 0);

	let gold = 0;

	for (let i = arr.length - 1; i >= 0; i--) {
		gold += isNaN(arr[i].price) ? (Math.random() < 0.5 ? mod : 0) : arr[i].price + mod;
	}

	src.addGold(gold);

	return arr.length + ' items sold for ' + gold + ' gold.';

}

export const sell = (src: Char, wot: ItemPicker, end?: ItemIndex | null) => {

	if (end != null) {
		if (typeof wot === 'object') return 'Invalid item range.';
		return sellRange(src, wot as ItemIndex, end);
	}

	const it = src.takeItem(wot);
	if (!it) return 'Item not found.';

	const mod = Math.max(src.level.valueOf() + src.getModifier('cha'), 0);

	const gold = isNaN(it.price) ? (Math.random() < 0.5 ? mod : 0) : it.price + mod;
	src.addGold(gold);
	return it.name + ' sold for ' + gold + ' gold.';

}

export const transfer = (src: Char, dest: Char, what: string) => {

	const res = goldAmt.exec(what);
	if (res !== null) {

		return xferGold(src, dest, res[1]);

	} else {

		const it = src.takeItem(what);
		if (it) {

			const ind = dest.addItem(it);
			src.addHistory('gave');
			dest.addHistory('given');

			return (it.name) ? `Gave ${dest.name} ${it.name}. (${ind})` : `Gave ${dest.name} the item.`;

		}
	}

	return "Item not found.";

}

const xferGold = (src: Char, dest: Char, count: number | string) => {

	if (typeof (count) === 'string') count = parseInt(count);
	if (isNaN(count)) return 'Amount is not a number.';

	const gold = src.gold - count;
	if (gold < 0) return "Not enough gold.";

	src.gold = gold;
	dest.addGold(count);

	return `Gave ${dest.name} ${count} gold.`;

}

export const nerfItems = (char: Char) => {

	const maxLevel = char.level.valueOf() + 1;

	const test = (it: Item) => {

		if (!it || !(it instanceof Wearable)) return false;

		if (it.level && it.level > maxLevel) return true;
		if (it.material) {

			const m = GetMaterial(it.material);
			if (m && m.level > maxLevel) return true;

		}

		return false;
	};

	const removed = char.inv.removeWhere(test);
	return 'Removed Items: ' + removed.map(it => it.name).join(', ');

}