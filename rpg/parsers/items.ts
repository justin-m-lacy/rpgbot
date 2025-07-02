import { Item } from "rpg/items/item";

export type ItemData = {
	id: string,
	name: string,
	type?: ItemType,
	desc?: string,
	cost?: number,
	maker?: string,
	inscrip?: string,
	level?: number,
	created?: number,
	/// file/image attachment
	attach?: string
}

export enum ItemType {

	Weapon = 'weapon',
	Armor = 'armor',
	Potion = 'potion',
	Food = 'food',
	Drink = 'drink',
	Scroll = 'scroll',
	Unique = 'unique',
	Chest = 'chest',
	Feature = 'feature',
	Grave = 'grave',
	Unknown = 'unknown'
}

/**
 * Since Item is subclassed, the sub item created
 * is passed as a param.
 * @param json
 * @param it
 */
export const ReviveItem
	= <T extends Item = Item, D extends ItemData = ItemData>(json: D, it: T) => {

		it.name = json.name;

		if (json.cost) it.cost = json.cost;
		if (json.attach) it.attach = json.attach;
		if (json.maker) it.maker = json.maker;
		if (json.inscrip) it.inscrip = json.inscrip;

		if (json.level && !Number.isNaN(json.level)) {
			it.level = json.level;
		}

		return it;

	}