
import { randElm } from '@/utils/jsutils';
import FeatureData from 'data/world/features.json';
import { GenShop } from 'rpg/builders/shopgen';
import { ReviveFeature } from 'rpg/parsers/items';
import { Feature } from 'rpg/world/feature';
import { Biome, Loc } from 'rpg/world/loc';

const byName: { [key: string]: typeof FeatureData[number] } = {};

/**
 * Create named feature from data.
 * @param s
 */
export const GenFeature = (s: string) => {
	return byName[s] ? ReviveFeature(byName[s]) : null;
}


export function InitFeatures() {

	for (let i = FeatureData.length - 1; i >= 0; i--) {
		byName[FeatureData[i].id] = byName[FeatureData[i].name] = FeatureData[i];
	}

}

export const RandFeature = (loc: Loc): Feature => {

	if (loc.biome === Biome.TOWN) {

		if (Math.random() < 0.5) {
			return GenShop(loc.biome, (loc.norm) / 15);
		}

	} else {
		if (Math.random() < 0.1) {
			return GenShop(loc.biome, (loc.norm) / 15);
		}
	}

	return ReviveFeature(randElm(FeatureData));

}