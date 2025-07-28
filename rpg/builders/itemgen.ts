import { randomUUID } from 'crypto';
import { Actor } from 'rpg/char/actor';
import { Char } from 'rpg/char/char';
import { Mob } from 'rpg/char/mobs';
import { Loot } from 'rpg/combat/loot';
import { Inventory } from 'rpg/items/inventory.js';
import { Item } from 'rpg/items/item';
import { LoadMaterials } from 'rpg/items/material';
import { ItemProto, ItemType } from 'rpg/items/types';
import { GenArmor } from 'rpg/parsers/armor';
import { ReviveItem } from 'rpg/parsers/items';
import { LvlPotion } from 'rpg/parsers/potions';
import { LvlScroll } from 'rpg/parsers/scrolls';
import { GenWeapon } from 'rpg/parsers/weapon';
import { Uppercase } from 'rpg/util/string';


export type RawChestsData = (typeof import('data/items/chests.json', { assert: { type: 'json' } }))[number] & { type?: "chest" };
type RawItemData = (typeof import('data/items/items.json', { assert: { type: 'json' } })['misc' | 'special'][number]) & { id: string }

/**
 * Master item prototypes. ( raw data)
 */
const ProtoItems: { [str: string]: RawItemData | RawChestsData | ItemProto } = Object.create(null);

const JunkItems: RawItemData[] = [];

const ItemTypeGen: Partial<Record<string, (lvl?: number) => Item | null>> = {

	[ItemType.Weapon]: GenWeapon,
	[ItemType.Armor]: GenArmor,
	[ItemType.Potion]: LvlPotion,
	[ItemType.Scroll]: LvlScroll
}

export const InitItems = async () => {

	return Promise.all([
		InitBasic(),
		InitChests(),
		LoadMaterials()
	]);

}

async function InitBasic() {

	const items = (await import('data/items/items.json', { assert: { type: 'json' } })).default;
	const spec = items.special as RawItemData[];

	JunkItems.push(...items.misc as RawItemData[]);

	for (let i = JunkItems.length - 1; i >= 0; i--) {

		if (!JunkItems[i].id) JunkItems[i].id = JunkItems[i].name!.toLowerCase();
		else if (!JunkItems[i].name) JunkItems[i].name = Uppercase(JunkItems[i].id!);

		ProtoItems[JunkItems[i].id] = JunkItems[i];
	}

	for (let i = spec.length - 1; i >= 0; i--) {

		if (!spec[i].id) spec[i].id = spec[i].name!.toLowerCase();
		else if (!spec[i].name) spec[i].name = Uppercase(spec[i].id!);

		ProtoItems[spec[i].id] = spec[i];
	}

}


async function InitChests() {

	const packs = (await import('data/items/chests.json', { assert: { type: 'json' } })).default;

	for (let i = packs.length - 1; i >= 0; i--) {

		const p: RawChestsData = packs[i];
		p.type = 'chest';	// assign type.

		ProtoItems[p.name.toLowerCase()] = p;

	}

}


export const GenLoot = (mob: Mob | Actor) => {

	const lvl = Math.floor(mob.level.valueOf());

	const loot: Loot = {
		items: [],
		gold: Math.random() < 0.5 ? Math.floor(20 * lvl * Math.random() + 0.1) : 0

	};

	if (Math.random() < 0.2) {
		const armor = GenArmor(lvl);
		if (armor) loot.items!.push(armor);
	}
	if (Math.random() < 0.1) {
		const weap = GenWeapon(lvl);
		if (weap) {
			loot.items!.push(weap);
		}
	}

	if ('drops' in mob) {
		const items = getDrops(mob);

		if (Array.isArray(items)) {
			loot.items.push(...items);
		} else if (items) loot.items.push(items);

	}


	return loot;

}

const getDrops = (mons: Mob) => {

	const drops = mons.drops;
	if (!drops) return;

	if (Array.isArray(drops)) {

		const it = drops[Math.floor(Math.random() * drops.length)];
		return GenItem(it);

	} else if (typeof (drops) === 'string') {

		return Math.random() < 0.7 ? GenItem(drops) : null;

	} else {

		const items = [];
		for (const k in drops) {

			if (100 * Math.random() < drops[k]) {
				const it = GenItem(k);
				if (it) items.push(it);
				else console.log('item not found: ' + k);
			}

		}
		return items;

	}

}

/**
 * Create new item w/ unique Id from proto item id.
 * @param protoId
 * @returns 
 */
export const GenItem = (protoId: string, into?: Inventory) => {

	if (!ProtoItems[protoId]) return null;

	const data = Object.create(ProtoItems[protoId]);
	data.id = randomUUID();
	const it = ReviveItem(data);
	if (it) into?.add(it);

	return it;

}

/**
 * Get generator for specific item type.
 * @param type 
 * @returns 
 */
export const GetTypeGenerator = (type: string) => {
	return ItemTypeGen[type];
}


/**
 * Create a useless item.
 */
export const GenJunkItem = () => {

	const it = JunkItems[Math.floor(JunkItems.length * Math.random())];

	const data = Object.create(it ?? null);
	data.id = randomUUID();

	return ReviveItem(data);

}

export const AddProtoItems = <T extends ItemProto>(arr: Record<string, T> | T[]) => {

	if (Array.isArray(arr)) {
		for (const it of arr) ProtoItems[it.id] = it;
	} else {
		for (const k in arr) {
			ProtoItems[arr[k].id] = arr[k];
		}
	}

}

export const AddProtoItem = <T extends ItemProto>(it: T) => {
	ProtoItems[it.id] = it;
	if (it.name) ProtoItems[it.name] = it;
}

export const GetProto = <T extends ItemProto>(s: string) => ProtoItems[s] as T;

export const Craft = (char: Char, name: string, desc?: string, embed?: string) => {

	const item = new Item({ name, desc });

	if (embed) item.embed = embed;

	item.maker = char.name;
	item.created = Date.now();

	const maxBonus = Math.max(char.level.value + char.getModifier('int') + 1, 2);
	item.price = Math.floor(maxBonus * Math.random());

	char.addHistory('crafts');
	char.addExp(2);
	return char.addItem(item);

}