
import { randElm } from '@/utils/jsutils';
import FeatureData from '../data/world/features.json';
import { Feature } from '../world/feature';

const byName: { [key: string]: typeof FeatureData[number] } = {};

/**
 * Create named feature from data.
 * @param s
 */
export const GenFeature = (s: string) => {
	return byName[s] ? Feature.Decode(byName[s]) : null;
}


export function InitFeatures() {

	for (let i = FeatureData.length - 1; i >= 0; i--) {
		byName[FeatureData[i].id] = byName[FeatureData[i].name] = FeatureData[i];
	}

}

export const RandFeature = () => {
	return Feature.Decode(randElm(FeatureData));
}