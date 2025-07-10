import { randElm } from "@/utils/jsutils";
import { GetTypeGenerator } from "rpg/builders/itemgen";
import { Shop } from "rpg/world/shop";


//const kinds = ['magic', 'potion', 'armor', 'weapon', 'junk', 'jewelry'];
const kinds = ['armor', 'weapon'];

export const GenShop = (biome: string, level: number) => {

	const kind = randElm(kinds);

	return new Shop(`${kind} store`, {
		kind,
		level, genItem: GetTypeGenerator(kind)
	});

}


