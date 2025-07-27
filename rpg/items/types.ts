
export type ItemInfo = {
	id?: string,
	type?: ItemType,
	name?: string,
	desc?: string
}

export type ItemData = {
	id: string,
	name: string,
	type?: ItemType,
	desc?: string,
	price?: number,
	maker?: string,
	inscrip?: string,
	level?: number,
	created?: number,
	/// file/image attachment
	embed?: string
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