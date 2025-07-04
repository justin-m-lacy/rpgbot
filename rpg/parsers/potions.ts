import { ProtoItems, RawPotionData } from 'rpg/builders/itemgen';
import { Potion } from 'rpg/items/potion';
import { ItemType } from 'rpg/parsers/items';

export const allPots: { [name: string]: RawPotionData } = {};
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

export const GenPotion = (name: string) => {
	return allPots[name] ? Potion.Decode(allPots[name]) : null;
}

export async function InitPotions() {

	const pots = (await import('../data/items/potions.json', { assert: { type: 'json' } })).default;

	for (let i = pots.length - 1; i >= 0; i--) {

		const p: RawPotionData = pots[i];
		p.type = ItemType.Potion;	// assign type.

		const name = p.name.toLowerCase();
		ProtoItems[name] = allPots[name] = p;

		const a = PotsByLevel[p.level] ?? (PotsByLevel[p.level] = []);
		a.push(p);

	}

	return allPots;

}

