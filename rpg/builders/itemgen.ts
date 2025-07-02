import { ItemType, ReviveItem } from 'rpg/parsers/items';
import { Loot } from '../combat/loot';
import BaseArmors from '../data/items/armors.json';
import BaseWeapons from '../data/items/weapons.json';
import { Material } from '../items/material';
import { Potion } from '../items/potion';
import { Weapon } from '../items/weapon';
import { HumanSlot, Wearable } from '../items/wearable';
import { Monster } from '../monster/monster';

type RawArmorData = (typeof BaseArmors)[number];
type RawWeaponData = (typeof BaseWeapons)[number];
type RawPotionData = (typeof import('../data/items/potions.json', { assert: { type: 'json' } }))[number] & { type?: "potion" };
type RawChestsData = (typeof import('../data/items/chests.json', { assert: { type: 'json' } }))[number] & { type?: "chest" };
type RawItemData = (typeof import('../data/items/items.json', { assert: { type: 'json' } })['misc' | 'special'][number])

const allItems: { [str: string]: RawItemData | RawPotionData | RawChestsData } = {};
const allPots: { [name: string]: RawPotionData } = {};
export const potsByLevel: { [key: number]: RawPotionData[] } = [];

let miscItems: RawItemData[];


const armorBySlot: Partial<{ [Property in HumanSlot]: RawArmorData[] }> = {};

export const InitItems = async () => {

	return Promise.all([
		initBasic(),
		initArmors(),
		initPots(),
		initScrolls(),
		initChests(),
		Material.LoadMaterials()
	]);

}

async function initBasic() {

	const items = (await import('../data/items/items.json', { assert: { type: 'json' } })).default;
	const spec = items.special;

	miscItems = items.misc;

	for (let i = miscItems.length - 1; i >= 0; i--) {
		allItems[miscItems[i].name.toLowerCase()] = miscItems[i];
	}

	for (let i = spec.length - 1; i >= 0; i--) {
		allItems[spec[i].name.toLowerCase()] = spec[i];
	}

}

async function initPots() {

	const pots = (await import('../data/items/potions.json', { assert: { type: 'json' } })).default;

	for (let i = pots.length - 1; i >= 0; i--) {

		const p: RawPotionData = pots[i];
		p.type = ItemType.Potion;	// assign type.

		const name = p.name.toLowerCase();
		allItems[name] = allPots[name] = p;

		const a = potsByLevel[p.level] ?? (potsByLevel[p.level] = []);
		a.push(p);

	}

	return allPots;

}

async function initChests() {

	const packs = (await import('../data/items/chests.json', { assert: { type: 'json' } })).default;

	for (let i = packs.length - 1; i >= 0; i--) {

		const p: RawChestsData = packs[i];
		p.type = 'chest';	// assign type.

		allItems[p.name.toLowerCase()] = p;

	}

}

function initScrolls() {
}

function initArmors() {

	for (let k = BaseArmors.length - 1; k >= 0; k--) {

		const armor = BaseArmors[k];
		const slot = armor.slot as HumanSlot;

		const list = armorBySlot[slot] ?? (armorBySlot[slot] = []);
		list.push(armor);

	}

}

export const genPot = (name: string) => {
	return allPots[name] ? Potion.Revive(allPots[name]) : null;
}

export const genWeapon = (lvl: number) => {

	const mat = Material.Random(lvl);
	if (mat === null) return null;

	//console.log( 'weaps len: ' + baseWeapons.length );
	const tmp = BaseWeapons[Math.floor(BaseWeapons.length * Math.random())];

	if (!tmp) {
		console.log('weapon template null.');
		return null;
	}

	return Weapon.FromData(tmp, mat);

}

export const genArmor = (slot: HumanSlot | null = null, lvl: number = 0) => {

	const mat = Material.Random(lvl);
	if (mat === null) return null;

	let tmp;
	if (slot) {
		tmp = getSlotRand(slot, lvl);
	} else {
		const list = BaseArmors.filter((t: RawArmorData) => !t.level || t.level <= lvl);
		tmp = list[Math.floor(list.length * Math.random())];
	}

	if (!tmp) return;

	return Wearable.FromData(tmp, mat);

}

const getSlotRand = (slot: HumanSlot, lvl: number = 0) => {

	const list = armorBySlot[slot]?.filter(t => !t.level || t.level <= lvl);
	if (!list || list.length === 0) return null;

	return list[Math.floor(list.length * Math.random())];

}



export const genLoot = (mons: Monster) => {

	const lvl = Math.floor(mons.level);

	const loot: Loot = {
		items: [

		],
		gold: Math.random() < 0.5 ? Math.floor(20 * lvl * Math.random() + 0.1) : 0

	};

	if (Math.random() < 0.2) {
		const armor = genArmor(null, lvl);
		if (armor) loot.items!.push(armor);
	}
	if (Math.random() < 0.1) {
		const weap = genWeapon(lvl);
		if (weap) {
			loot.items!.push(weap);
		}
	}

	if (mons.drops) {
		console.log('GETTING MONS DROPS.');
		const itms = getDrops(mons);
		if (itms) loot.items = loot.items!.concat(itms);
	}


	return loot;

}

const getDrops = (mons: Monster) => {

	const drops = mons.drops;
	if (!drops) return;

	if (Array.isArray(drops)) {

		const it = drops[Math.floor(Math.random() * drops.length)];
		return procItem(it);

	} else if (typeof (drops) === 'string') {

		return Math.random() < 0.7 ? procItem(drops) : null;

	} else {

		const items = [];
		for (const k in drops) {

			if (100 * Math.random() < drops[k]) {
				const it = procItem(k);
				if (it) items.push(it);
				else console.log('item not found: ' + k);
			}

		}
		return items;

	}

}

const procItem = (name: string) => {
	return allItems[name] ? ReviveItem(allItems[name]) : null;
}

/**
 * Returns a useless item.
 */
export const getMiscItem = () => {

	const it = miscItems[Math.floor(miscItems.length * Math.random())];
	return ReviveItem(it);

}


export const PotsList = (level: number) => {

	const a = potsByLevel[level];
	if (!a) return `No potions of level ${level}.`;

	const len = a.length;

	let s = `${a[0].name}`;
	for (let i = 1; i < len; i++) s += `, ${a[i].name}`;
	s += '.';

	return s;

}