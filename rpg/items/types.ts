import { TOnDrop } from "rpg/effects/ondrop";

export type RawItemData = (typeof import('data/items/items.json', { assert: { type: 'json' } })['misc' | 'special'][number]) & { id: string }

export type ItemInfo<T extends object = {}> = Partial<ItemProto>;

export type ItemProto = {
	id: string,
	name?: string,
	type?: ItemType,
	desc?: string,
	price?: number,
	maker?: string,
	inscrip?: string,
	level?: number,
	created?: number,
	/// file/image attachment
	embed?: string,
	ondrop?: TOnDrop
}

export enum ItemType {

	Weapon = 'weapon',
	Armor = 'armor',
	Spell = 'spell',
	Shop = 'shop',
	Potion = 'potion',
	Inv = 'inv',
	Food = 'food',
	Drink = 'drink',
	Scroll = 'scroll',
	Grimoire = 'grimoire',
	Unique = 'unique',
	Chest = 'chest',
	Feature = 'feature',
	Grave = 'grave',
	// general item.
	Item = 'item',
	Unknown = 'unknown'
}