import { Chest } from "rpg/items/chest";
import { Grave } from "rpg/items/grave";
import { Grimoire } from "rpg/items/grimoire";
import { Item } from "rpg/items/item";
import { Potion } from "rpg/items/potion";
import { Wearable } from "rpg/items/wearable";
import { Spell } from "rpg/magic/spell";
import { Feature } from "rpg/world/feature";

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

const ItemDecoders: Record<string, (data: any) => Item> = {
	[ItemType.Armor]: Wearable.Decode,
	[ItemType.Weapon]: Wearable.Decode,
	[ItemType.Spell]: Spell.Decode,
	[ItemType.Potion]: Potion.Decode,
	[ItemType.Grimoire]: Grimoire.Decode,
	[ItemType.Grave]: Grave.Decode,
	[ItemType.Chest]: Chest.Decode,

	[ItemType.Feature]: Feature.Decode,
	[ItemType.Unknown]: Item.InitData,
}


/**
 * revive item from JSON
*/
export const DecodeItem = (json: any): Item | null | undefined => {

	if (!json) return null;
	return ItemDecoders[json.type]?.(json) ?? ItemDecoders[ItemType.Unknown](json);

}