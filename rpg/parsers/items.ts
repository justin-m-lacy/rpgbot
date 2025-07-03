import { Chest } from "rpg/items/chest";
import { Grave } from "rpg/items/grave";
import { Item } from "rpg/items/item";
import { Potion } from "rpg/items/potion";
import { Weapon } from "rpg/items/weapon";
import { Wearable } from "rpg/items/wearable";
import { Spell } from "rpg/magic/spell";

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
	Spell = 'spell',
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
export const DecodeItem = (json: any): Item | null | undefined => {

	if (!json) return null;

	switch (json.type) {
		case ItemType.Armor:
			return Wearable.Decode(json);

		case ItemType.Weapon:
			return Weapon.Decode(json);

		case ItemType.Spell:
			return Spell.Decode(json);

		case ItemType.Potion:
			return Potion.Decode(json);

		case 'grave':
			return Grave.Decode(json);

		case 'chest':
			return Chest.Decode(json);

		default:
			return Item.InitData(json);
	}

}