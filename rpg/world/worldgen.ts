import { RandFeature } from 'rpg/builders/features';
import { Coord } from 'rpg/world/coord';
import Biomes from '../data/world/biomes.json';
import { Biome, Exit, Loc } from './loc';

type BiomeName = keyof typeof Biomes;

/**
 * 
 * @param  coord 
 * @param  from - location arriving from.
 * @param  adj - all allowed exits.
 */
export const GenLoc = (coord: Coord, from?: Loc, exits?: Exit[]): Loc => {

	const biomeName = from ? randBiome(from.biome as BiomeName) : Biome.TOWN;
	const loc = makeBiomeLoc(coord, biomeName as BiomeName);

	if (exits) {
		for (let i = exits.length - 1; i >= 0; i--) {
			loc.addExit(exits[i]);
		}
	} else {
		const exits = genExits(coord.x, coord.y);
		let k: keyof typeof exits;
		for (k in exits) {
			loc.exits[k] = exits[k];
		}
	}

	while (Math.random() < 0.1) {
		loc.addFeature(RandFeature(loc));
	}

	return loc;

}


/**
 * Generate starting exits.
 */
export const genExits = (x: number, y: number) => {

	return {
		w: new Exit('w', new Coord(x - 1, y)),
		e: new Exit('e', new Coord(x + 1, y)),
		n: new Exit('n', new Coord(x, y + 1)),
		s: new Exit('s', new Coord(x, y - 1))
	};

}

export const makeBiomeLoc = (coord: Coord, biomeName: keyof typeof Biomes = Biome.PLAINS) => {

	const tmpl = Biomes[biomeName];
	if (tmpl == null) {
		console.warn('BAD BIOME: ' + biomeName);
	}
	const loc = new Loc(coord, biomeName);

	const descs = tmpl.descs;
	loc.desc = descs[Math.floor(Math.random() * descs.length)];

	return loc;

}


/**
 * 
 * @param prevBiome - name of previous biome.
 */
function randBiome(prevBiome: keyof typeof Biomes) {

	const biome = Biomes[prevBiome];
	if (biome == null) {
		console.warn('unknown biome: ' + prevBiome);
		return Biome.TOWN;
	}

	const trans = biome.trans;
	const w = Math.random() * getTransMax(trans);

	let tot = 0;

	let k: keyof typeof trans;
	for (k in trans) {

		tot += trans[k];
		if (w <= tot) {
			return k;
		}
	}

}

/**
* Returns and caches total weights in biome-transitions object.
* @param trans 
*/
function getTransMax(trans: Record<string, number>) {

	if (trans.max) return trans.max;
	let max = 0;
	for (const k in trans) {
		max += trans[k];
	}
	trans.max = max;
	return max;

}