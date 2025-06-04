
import FeatureData from '../data/world/features.json';
import { Feature } from '../world/feature';

const byName: { [key: string]: typeof FeatureData[number] } = {};

initFeatures();

/**
 * Create named feature from data.
 * @param {string} s
 */
export const genFeature = (s: string) => {
	const d = byName[s];
	return d ? Feature.Revive(d) : null;
}


function initFeatures() {

	for (let i = FeatureData.length - 1; i >= 0; i--) {
		byName[FeatureData[i].name] = FeatureData[i];

	}

}

export const randFeature = () => {

	const data = FeatureData[Math.floor(FeatureData.length * Math.random())];
	return Feature.Revive(data);

}