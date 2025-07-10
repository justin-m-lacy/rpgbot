import { GetTypeGenerator } from "rpg/builders/itemgen";
import { Chest } from "rpg/items/chest";
import { Grave } from "rpg/items/grave";
import { Grimoire } from "rpg/items/grimoire";
import { Item } from "rpg/items/item";
import { Potion } from "rpg/items/potion";
import { ItemData, ItemType } from "rpg/items/types";
import { GetAction } from "rpg/magic/action";
import { DecodeWearable } from "rpg/parsers/armor";
import { DecodeSpell } from "rpg/parsers/spells";
import { Feature } from "rpg/world/feature";
import { Shop } from "rpg/world/shop";

const ItemDecoders: Record<string, (data: any) => Item> = {
	[ItemType.Armor]: DecodeWearable,
	[ItemType.Weapon]: DecodeWearable,
	[ItemType.Spell]: DecodeSpell,
	[ItemType.Potion]: Potion.Decode,
	[ItemType.Grimoire]: Grimoire.Decode,
	[ItemType.Grave]: Grave.Decode,
	[ItemType.Chest]: Chest.Decode,
	[ItemType.Shop]: DecodeShop,
	[ItemType.Feature]: DecodeFeature,
	[ItemType.Unknown]: Item.InitData,
}


/**
 * revive item from JSON
*/
export const DecodeItem = (json: any): Item | null | undefined => {

	if (!json) return null;
	return ItemDecoders[json.type]?.(json) ?? ItemDecoders[ItemType.Unknown](json);

}

function DecodeShop(json: any): Shop {

	const shop = new Shop(json.name, {
		kind: json.kind,
		level: json.level, desc: json.desc,
		genItem: GetTypeGenerator(json.kind)
	});

	DecodeFeature(json, shop);

	return shop;

}

export function DecodeFeature<T extends Feature>(
	json: ItemData & { desc: string, action?: string, fb?: string }, f?: T | Feature) {

	f ??= new Feature(json.name, json.desc);

	if (json.action) {
		f.action = GetAction(json.action);
	}
	if (json.fb) f.fb = json.fb;

	return Item.InitData(json, f) as Feature;

}
