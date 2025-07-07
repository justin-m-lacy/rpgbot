import { Chest } from "rpg/items/chest";
import { Grave } from "rpg/items/grave";
import { Grimoire } from "rpg/items/grimoire";
import { Item } from "rpg/items/item";
import { Potion } from "rpg/items/potion";
import { ItemType } from "rpg/items/types";
import { Spell } from "rpg/magic/spell";
import { DecodeWearable } from "rpg/parsers/armor";
import { Feature } from "rpg/world/feature";

const ItemDecoders: Record<string, (data: any) => Item> = {
	[ItemType.Armor]: DecodeWearable,
	[ItemType.Weapon]: DecodeWearable,
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