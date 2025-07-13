import { randElm } from '@/utils/jsutils';
import { AddProtoItems } from 'rpg/builders/itemgen';
import { Potion } from 'rpg/items/potion';
import { ItemData, ItemType } from 'rpg/items/types';

export type RawPotionData = (typeof import('data/items/potions.json', { assert: { type: 'json' } }))[number] & ItemData;

const potsByName: { [name: string]: RawPotionData } = {};
const PotsByLevel: { [key: number]: RawPotionData[] } = [];

export const PotsList = (level: number) => {

	const a = PotsByLevel[level];
	if (!a) return `No potions of level ${level}.`;

	const len = a.length;

	let s = `${a[0].name}`;
	for (let i = 1; i < len; i++) s += `, ${a[i].name}`;
	s += '.';

	return s;

}

/**
 * Generate a potion up to level.
 * @param lvl 
 * @returns 
 */
export const LvlPotion = (lvl: number = 0) => {

	lvl = Math.floor(lvl);
	while (lvl >= 0) {
		const list = PotsByLevel[lvl];
		if (list?.length && Math.random() < 0.4) {
			return Potion.Decode(randElm(list));
		}

	}
	const list = PotsByLevel[1];
	if (list.length) {
		return Potion.Decode(randElm(list));
	}
	return null;


}

export const GenPotion = (name: string) => {
	return potsByName[name] ? Potion.Decode(potsByName[name]) : null;
}

export async function InitPotions() {

	const pots = (await import('data/items/potions.json', { assert: { type: 'json' } })).default;

	for (let i = pots.length - 1; i >= 0; i--) {

		const p = pots[i] as RawPotionData;
		p.id ??= p.name.toLowerCase();

		p.type = ItemType.Potion;	// assign type.

		potsByName[p.name] = potsByName[p.id] = p;

		const a = PotsByLevel[p.level] ?? (PotsByLevel[p.level] = []);
		a.push(p);

	}

	AddProtoItems(potsByName);

}

