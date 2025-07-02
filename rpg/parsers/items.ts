import { Chest } from "rpg/items/chest";
import { Grave } from "rpg/items/grave";
import { Item } from "rpg/items/item";
import { Potion } from "rpg/items/potion";
import { Weapon } from "rpg/items/weapon";
import { Wearable } from "rpg/items/wearable";

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
	Grimoire = 'grimoire',
	Unique = 'unique',
	Chest = 'chest',
	Feature = 'feature',
	Grave = 'grave',
	Unknown = 'unknown'
}

/**
 * revive item from JSON
*/
export const ReviveItem = (json: any): Item | null | undefined => {

	if (!json) return null;

	switch (json.type) {
		case ItemType.Armor:
			return Wearable.Revive(json);

		case ItemType.Weapon:
			return Weapon.Revive(json);

		case ItemType.Potion:
			return Potion.Revive(json);

		case 'grave':
			return Grave.Revive(json);

		case 'chest':
			return Chest.Revive(json);

		default:
			return Item.InitData(json);
	}

}