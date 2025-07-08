import { ItemList } from "rpg/display/items";
import type { ItemIndex } from "rpg/items/container";
import { DecodeItem } from "rpg/parsers/items";
import { quickSplice } from "rpg/util/array";
import { IsInt } from "rpg/util/parse";
import { Char } from '../char/char';
import { Inventory } from '../inventory';
import { Item } from "../items/item";
import { Mob } from '../monster/mobs';
import { Feature } from './feature';

export type DirVal = 'n' | 's' | 'e' | 'w' | 'u' | 'd' | 'l' | 'r' | 'x' | 'enter';
export type DirString = DirVal | 'north' | 'south' | 'east' | 'west' | 'exit' | 'up' | 'down' | 'left' | 'right';

export const toDirection = (s: string): DirVal => {
	return DirMap[s.toLowerCase()] ?? 'unknown';
}

const DirStrings: Record<DirString, string> = {
	north: 'North',
	n: 'North',
	south: 'South',
	s: 'South',
	east: 'East',
	e: 'East',
	west: 'West',
	w: 'West',
	up: 'Up',
	u: 'Up',
	down: 'Down',
	d: 'Down',
	left: 'Left',
	l: 'Left',
	right: 'Right',
	r: 'Right',
	exit: 'Exit',
	x: 'Exit',
	enter: 'Enter',
}

export const ToDirStr = (v: DirString) => {
	return DirStrings[v];
}
export enum Biome {
	FOREST = 'forest',
	TOWN = 'town',
	SWAMP = 'swamp',
	PLAINS = 'plains',
	HILLS = 'hills',
	MOUNTAIN = 'mountains',
	UNDER = 'underground',
}

const in_prefix: { [Property in Biome]: string } = {
	[Biome.FOREST]: ' in a ',
	[Biome.TOWN]: ' in a ',
	[Biome.SWAMP]: ' in a ',
	[Biome.PLAINS]: ' on the ',
	[Biome.HILLS]: ' in the ',
	[Biome.MOUNTAIN]: ' in the ',
	[Biome.UNDER]: ' '
};

const DirMap: { [s: string]: DirVal } = {

	north: 'n',
	n: 'n',
	south: 's',
	s: 's',
	east: 'e',
	e: 'e',
	west: 'w',
	w: 'w',
	up: 'u',
	u: 'u',
	down: 'd',
	d: 'd',
	left: 'l',
	l: 'l',
	right: 'r',
	r: 'r',
	exit: 'x',
	x: 'x',
	enter: 'enter',
}

/**
 * Maps direction to its opposite direction.
 */
const OppositeDirs: Partial<Record<DirString, DirVal>> = {
	enter: DirMap.exit,
	north: DirMap.south,
	n: DirMap.south,

	south: DirMap.north,
	s: DirMap.north,

	east: DirMap.west,
	e: DirMap.west,

	west: DirMap.east,
	w: DirMap.east,

	left: DirMap.right,
	l: DirMap.right,

	right: DirMap.left,
	r: DirMap.left,

	up: DirMap.down,
	u: DirMap.down,

	down: DirMap.up,
	d: DirMap.up,

	exit: DirMap.enter,
	x: DirMap.enter
};

export const IsCoord = (obj: any): obj is { x: number, y: number } => {
	return obj && typeof obj === 'object' && typeof obj.x === 'number' && typeof obj.y === 'number';
}

export type TCoord = {
	x: number, y: number
}

export class Coord implements TCoord {

	x: number;
	y: number;

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	setTo(coord: TCoord) {
		this.x = coord.x;
		this.y = coord.y;
	}

	/**
	 * @returns absolute distance from origin.
	 */
	abs() { return Math.abs(this.x) + Math.abs(this.y); }

	/**
	 * Get distance to another coordinate.
	 * @param c - second coordinate
	 * @returns
	 */
	dist(c: Coord) { return Math.abs(c.x - this.x) + Math.abs(c.y - this.y); }

	equals(c: Coord) {
		return c.x === this.x && c.y === this.y;
	}

	toString() {
		return this.x + ',' + this.y;
	}

}

export class Loc {

	toJSON() {

		return {
			coord: this.coord,
			exits: this.exits,
			inv: this.inv,
			desc: this.desc,
			chars: this.chars.length > 0 ? this.chars : undefined,
			name: this.name,
			biome: this.biome,
			npcs: this.npcs.length > 0 ? this.npcs : undefined,
			features: this.features,
			embed: this.embed,
			maker: this._maker,
			time: this.time ?? undefined,
			owner: this._owner

		};

	}

	get key() { return this._key; }

	get x() { return this.coord.x; }
	get y() { return this.coord.y; }

	get norm() { return Math.abs(this.coord.x) + Math.abs(this.coord.y); }

	get maker() { return this._maker; }
	get owner() { return this._owner; }
	set owner(v) { this._owner = v; }

	get items() { return this.inv.items }

	name?: string;
	desc?: string;

	biome: string;
	private _maker?: string;
	embed?: string;
	private _owner?: string;
	time?: number;

	readonly features: Inventory<Feature>;

	private _key!: string;
	readonly coord: Coord;

	/**
	 * player characters at location.
	 */
	readonly chars: string[] = [];

	/**
	 * npcs at location.
	 */
	readonly npcs: Mob[] = [];

	readonly exits: Partial<Record<DirVal, Exit>> = {};
	readonly inv: Inventory;

	constructor(coord: Coord, biome: string) {

		this.coord = coord;
		this.biome = biome;

		this.features = new Inventory();
		this.inv = new Inventory();

	}

	/**
	 * add character to this location.
	 * @param char 
	 */
	addChar(char: Char) {
		char.at.setTo(this.coord);
		if (!this.chars.includes(char.id)) {
			this.chars.push(char.id);
		}
	}

	addItem(it: Item | Item[]) {
		return this.inv.add(it);
	}

	rmChar(char: Char) {
		const ind = this.chars.indexOf(char.id);
		if (ind >= 0) quickSplice(this.chars, ind);
	}

	hasChars() { return this.chars.length > 0 }

	static Decode(json: any) {

		const loc = new Loc(new Coord(json.coord.x, json.coord.y), json.biome);

		const exits = json.exits;
		if (exits && typeof exits === 'object') {

			for (const k in exits) {
				const e = exits[k];
				loc.addExit(
					new Exit(k as DirVal, new Coord(e.to.x, e.to.y))
				);

			}

		} else {
			console.error(`No exits: ${json}`);
		}

		if (json.features) {
			Inventory.Decode<Feature>(
				json.features, Feature.Decode, loc.features
			);
		}
		if (json.attach) loc.embed = json.attach;

		if (json.inv) {
			Inventory.Decode<Item>(json.inv, DecodeItem, loc.inv);
		}

		loc.name = json.name;
		loc.desc = json.desc;

		if (json.npcs) Loc.ParseNpcs(json.npcs, loc);

		if (json.owner) loc._owner = json.owner;
		if (json.maker) loc._maker = json.maker;
		if (json.time) loc.time = json.time;

		return loc;

	}

	static ParseNpcs(a: any[], loc: Loc) {

		const len = a.length;
		for (let i = 0; i < len; i++) {

			const m = Mob.Decode(a[i]);
			if (m) loc.addNpc(m);

		}

	}

	setMaker(n: string) {
		this._maker = n;
		this.time = Date.now();
	}

	explored() {

		if (!this._maker) return 'Never explored.';
		if (this.time) return `Explored by ${this._maker} at ${new Date(this.time).toLocaleDateString()}`;
		return 'First explored by ' + this._maker + '.';

	}

	hasExit(dir: DirVal) {
		return this.exits.hasOwnProperty(dir);
	}

	/**
	 * Add a new exit from this location.
	 * @param exit
	 */
	addExit(exit: Exit) {
		//console.log( 'adding exit ' + exit);
		this.exits[exit.dir] = exit;
	}

	/**
	 *
	 * @param dir
	 */
	getExit(dir: DirVal) {
		return this.exits[dir];
	}

	/**
	 * Returns the exit that leads back from the given direction.
	 * e.g. fromDir == 'west' returns the 'east' exit, if it exists.
	 * @param fromDir - direction arriving from.
	 * @returns
	 */
	reverseExit(fromDir: DirVal) {
		const reverse = OppositeDirs[fromDir];
		return reverse ? this.exits[reverse] : undefined;
	}

	/**
	 * Returns exit leading to coord, or null
	 * if none exists.
	 * @param coord
	 * @returns
	 */
	getExitTo(coord: Coord): Exit | undefined {

		let k: DirVal;
		for (k in this.exits) {
			if (this.exits[k]?.to.equals(coord)) {
				return this.exits[k];
			}
		}
		return undefined;

	}

	view() { return [this.look(undefined, true), this.embed]; }

	/**
	 * Returns text seen by character looking at location.
	 * @param looker 
	 * @param imgTag 
	 * @param showPaths 
	 * @returns 
	 */
	look(looker?: Char, imgTag: boolean = true, showPaths: boolean = false) {

		let r = in_prefix[this.biome as Biome] + this.biome;//+ ' (' + this._coord.toString() + ')';
		if (this.embed && imgTag) r += ' [img]';
		r += '\n' + this.desc;

		if (this.features.count > 0) r += '\nFeatures: ' + ItemList(this.features);
		r += '\nOn ground: ' + ItemList(this.inv);


		if (this.chars.length > 0) {

			const text = this.charList(looker?.name);
			if (text) {
				r += '\nChars: ' + text;
			}

		}

		if (this.npcs.length > 0) {
			r += '\nCreatures: ' + this.npcList();
		}

		if (showPaths) {
			r += '\nPaths:'
			for (const k in this.exits) {
				r += '\t' + ToDirStr(k as DirVal);
			}
		}

		return r;

	}

	/**
	 *
	 * @param char
	 * @param wot
	 */
	use(char: Char, wot: string | number | Feature) {

		let f: Feature | null;
		if (typeof wot !== 'object') {
			f = this.features.get(wot) as Feature;
			if (!f) return false;
		} else {
			f = wot;
		}

		return f.use(char);

	}

	/**
	 *
	 * @param f
	 */
	addFeature(f: Feature | null) { if (f) this.features.add(f); }

	/**
	 *
	 * @param wot
	 */
	getFeature(wot: string | number) { return this.features.get(wot) as Feature; }

	/**
	 * Get item data without taking it.
	 */
	get(item: ItemIndex) { return this.inv.get(item); }

	/**
	 *
	 * @param item
	 */
	put(item: Item | Item[]) { return this.inv.add(item); }

	takeRange(start: number, end: number) {
		return this.inv.takeRange(start, end);
	}

	/**
	 *
	 * @param what
	 */
	take(what: ItemIndex) { return this.inv.take(what); }

	getNpc(wot: ItemIndex) {

		if (typeof wot === 'string') {

			if (!IsInt(wot)) {
				return this.npcs.find((m) => m.id === wot || m.name === wot);
			} else {
				wot = Number.parseInt(wot);
			}
		}
		return this.npcs[wot - 1];
	}

	addNpc(m: Mob) { this.npcs.push(m); }

	removeNpcAt = (ind: number) => {
		quickSplice(this.npcs, ind);
	}

	removeNpc(m: Mob) {

		const ind = this.npcs.indexOf(m);
		console.log('remove npc at: ' + ind);
		if (ind >= 0) quickSplice(this.npcs, ind);

	}

	charList(looker?: string) {

		if (this.chars.length === 1 && this.chars[0] === looker) return undefined;
		return this.chars.join(', ');

	}

	npcList() {

		let len = this.npcs.length;
		if (len === 0) return 'none';
		if (len === 1) return this.npcs[0].name;

		let s = this.npcs[0].name;
		for (let i = 1; i < len; i++) s += ', ' + this.npcs[i].name;
		return s;

	}

}

export class Exit {

	static Reverse(dir: DirVal) {
		return OppositeDirs[dir];
	}

	toJSON() {
		return {
			to: this.to
		}
	}

	dir: DirVal;
	to: Coord;

	constructor(dir: DirVal, toCoord: Coord) {

		this.dir = dir;
		this.to = toCoord;

	}

	toString() {
		return 'exit ' + this.dir + ' to ' + this.to;
	}

}