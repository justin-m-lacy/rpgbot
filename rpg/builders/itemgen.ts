import { randomUUID } from 'crypto';
import { Char } from 'rpg/char/char';
import { Inventory } from 'rpg/inventory';
import { Item } from 'rpg/items/item';
import { GenArmor } from 'rpg/parsers/armor';
import { DecodeItem, ItemData } from 'rpg/parsers/items';
import { GenWeapon } from 'rpg/parsers/weapon';
import { Loot } from '../combat/loot';
import { Material } from '../items/material';
import { Monster } from '../monster/monster';



export type RawChestsData = (typeof import('../data/items/chests.json', { assert: { type: 'json' } }))[number] & { type?: "chest" };
type RawItemData = (typeof import('../data/items/items.json', { assert: { type: 'json' } })['misc' | 'special'][number]) & { id: string }

/**
 * Master item prototypes. ( raw data)
 */
export const ProtoItems: { [str: string]: RawItemData | RawChestsData | ItemData } = {};

/**
 * Master item table. (constant items such as grimoires)
 */
const ItemTable: Record<string, Item> = {};

const MiscItems: RawItemData[] = [];

export const InitItems = async () => {

	return Promise.all([
		InitBasic(),
		InitChests(),
		Material.LoadMaterials()
	]);

}

async function InitBasic() {

	const items = (await import('../data/items/items.json', { assert: { type: 'json' } })).default;
	const spec = items.special as RawItemData[];

	MiscItems.push(...items.misc as RawItemData[]);

	for (let i = MiscItems.length - 1; i >= 0; i--) {
		(MiscItems[i] as RawItemData).id ??= MiscItems[i].name.toLowerCase();
		ProtoItems[MiscItems[i].id] = MiscItems[i];
	}

	for (let i = spec.length - 1; i >= 0; i--) {
		(spec[i] as RawItemData).id ??= spec[i].name.toLowerCase();
		ProtoItems[spec[i].id] = spec[i];
	}

}


async function InitChests() {

	const packs = (await import('../data/items/chests.json', { assert: { type: 'json' } })).default;

	for (let i = packs.length - 1; i >= 0; i--) {

		const p: RawChestsData = packs[i];
		p.type = 'chest';	// assign type.

		ProtoItems[p.name.toLowerCase()] = p;

	}

}


export const genLoot = (mons: Monster) => {

	const lvl = Math.floor(mons.level);

	const loot: Loot = {
		items: [

		],
		gold: Math.random() < 0.5 ? Math.floor(20 * lvl * Math.random() + 0.1) : 0

	};

	if (Math.random() < 0.2) {
		const armor = GenArmor(null, lvl);
		if (armor) loot.items!.push(armor);
	}
	if (Math.random() < 0.1) {
		const weap = GenWeapon(lvl);
		if (weap) {
			loot.items!.push(weap);
		}
	}

	if (mons.drops) {
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
 * Create new item from base item id.
 * Gives the item a new unique id.
 * @param protoId
 * @returns 
 */
export const GenItem = (protoId: string, into?: Inventory) => {

	if (!ProtoItems[protoId]) return null;

	const data = Object.create(ProtoItems[protoId]);
	data.id = randomUUID();
	const it = DecodeItem(data);
	if (it) into?.add(it);

	return it;

}

/**
 * Returns a useless item.
 */
export const GenMiscItem = () => {

	const it = MiscItems[Math.floor(MiscItems.length * Math.random())];
	return DecodeItem(it);

}

export const AddProtoItems = <T extends ItemData>(arr: Record<string, T> | T[]) => {

	if (Array.isArray(arr)) {
		for (const it of arr) ProtoItems[it.id] = it;
	} else {
		for (const k in arr) {
			ProtoItems[arr[k].id] = arr[k];
		}
	}

}

export const AddMasterItems = <T extends Item>(arr: T[]) => {
	for (const it of arr) ProtoItems[it.id] = it;
}

export const Craft = (char: Char, name: string, desc?: string, attach?: string) => {

	const item = new Item(randomUUID({}), { name, desc });

	if (attach) item.attach = attach;

	item.maker = char.name;
	item.created = Date.now();

	const maxBonus = Math.max(char.level.value + char.getModifier('int') + 1, 2);
	item.cost = Math.floor(maxBonus * Math.random());

	char.addHistory('crafts');
	char.addExp(2);
	return char.addItem(item);

}