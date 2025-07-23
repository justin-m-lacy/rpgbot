import { GetTypeGenerator } from "rpg/builders/itemgen";
import { Chest } from "rpg/items/chest";
import { Grave } from "rpg/items/grave";
import { Grimoire } from "rpg/items/grimoire";
import { Item } from "rpg/items/item";
import { Potion } from "rpg/items/potion";
import { ItemData, ItemType } from "rpg/items/types";
import { GetAction } from "rpg/magic/action";
import { ReviveWeapon, ReviveWearable } from "rpg/parsers/armor";
import { DecodeSpell } from "rpg/parsers/spells";
import { Feature } from "rpg/world/feature";
import { Shop } from "rpg/world/shop";

const ItemDecoders: Record<string, (data: any) => Item> = {
	[ItemType.Armor]: ReviveWearable,
	[ItemType.Weapon]: ReviveWeapon,
	[ItemType.Spell]: DecodeSpell,
	[ItemType.Potion]: Potion.Decode,
	[ItemType.Grimoire]: Grimoire.Decode,
	[ItemType.Grave]: Grave.Decode,
	[ItemType.Chest]: Chest.Decode,
	[ItemType.Shop]: ReviveShop,
	[ItemType.Feature]: ReviveFeature,
	[ItemType.Unknown]: Item.SetProtoData,
}


/**
 * revive item from JSON
*/
export const DecodeItem = <T extends Item>(json: any): T | null => {

	if (!json) return null;
	return (ItemDecoders[json.type]?.(json) as T ?? ItemDecoders[ItemType.Unknown](json) as T) ?? null;

}

export function ReviveFeature<T extends Feature>(
	json: ItemData & { action?: string, fb?: string }, f?: T | Feature) {

	f ??= new Feature(json);

	if (json.action) {
		f.action = GetAction(json.action);
	}
	if (json.fb) f.fb = json.fb;

	return Item.SetProtoData(json, f) as Feature;

}

function ReviveShop(json: any): Shop {

	const shop = new Shop({
		id: json.id,
		name: json.name,
		kind: json.kind,
		level: json.level, desc: json.desc,
		genItem: GetTypeGenerator(json.kind)
	});

	ReviveFeature(json, shop);

	return shop;

}