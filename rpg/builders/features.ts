
import { randElm } from '@/utils/jsutils';
import FeatureData from 'data/world/features.json';
import { GenShop } from 'rpg/builders/shopgen';
import { ParseEffect } from 'rpg/effects/effect';
import { Item } from 'rpg/items/item';
import { Feature, FeatureProto } from 'rpg/world/feature';
import { Biome, Loc } from 'rpg/world/loc';

// by name or id.
const byId: { [key: string]: typeof FeatureData[number] } = {};

/**
 * Create named feature from data.
 * @param s
 */
export const GenFeature = (s: string) => {
	return byId[s] ? ReviveFeature(byId[s]) : null;
}


export function InitFeatures() {

	for (let i = FeatureData.length - 1; i >= 0; i--) {

		byId[FeatureData[i].id] = byId[FeatureData[i].name.toLowerCase()] = FeatureData[i];

	}

}

export function ReviveFeature<T extends Feature>(
	json: FeatureProto & { proto?: string }, f?: T | Feature) {

	f ??= new Feature<any>(json, json.proto ? byId[json.proto] : undefined);

	if (json.effect) {
		f!.effect = ParseEffect(json.effect);
	}

	return Item.SetProtoData(json, f) as Feature;

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