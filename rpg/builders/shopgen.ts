import { randElm } from "@/utils/jsutils";
import { GetTypeGenerator } from "rpg/builders/itemgen";
import { ItemType } from "rpg/items/types";
import { uppercase } from "rpg/util/string";
import { Shop } from "rpg/world/shop";


//const kinds = ['magic', 'potion', 'armor', 'weapon', 'junk', 'jewelry'];
const kinds = [ItemType.Armor, ItemType.Weapon];

export const GenShop = (biome: string, level: number) => {

	const kind = randElm(kinds);

	return new Shop(`${uppercase(kind)} Shop`, {
		kind,
		level, genItem: GetTypeGenerator(kind)
	}).restock();

}


