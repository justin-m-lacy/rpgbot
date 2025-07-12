import Cache from 'archcache';
import { GenFeature } from 'rpg/builders/features';
import { GenShop } from 'rpg/builders/shopgen';
import { ItemType } from 'rpg/items/types';
import { RandMonster } from 'rpg/parsers/mobs';
import { Coord, TCoord } from 'rpg/world/coord';
import { GenLoc } from 'rpg/world/worldgen';
import { Char } from '../char/char';
import { ItemIndex, ItemPicker } from '../items/container';
import { Item } from '../items/item';
import { Mob } from '../monster/mobs';
import Block from './block';
import { Feature } from './feature';
import { DirString, DirVal, Exit, Loc } from './loc';

// Locations are merged into blocks of width/block_size, height/block_size.
// WARNING: Changing block size will break the fetching of existing world data.
const BLOCK_SIZE = 16;

export class World {

	readonly cache: Cache<Block>;

	/**
	 * Note that the World is using the Context cache, not a special rpg cache.
	 * Why?
	 * @param fcache
	 */
	constructor(fcache: Cache<Block>) {

		this.cache = fcache;
		this.initWorld();

	}

	private async initWorld() {
		const st = await this.getOrGen(new Coord(0, 0));
		if (!st.getFeature('shrine')) {
			st.addFeature(GenFeature('shrine'));
		}
		if (!st.features.some(f => f.type === ItemType.Shop)) {
			st.addFeature(GenShop(st.biome, 1));
		}
	}

	/**
	 * Change location description.
	 * @param char
	 * @param desc
	 */
	async setDesc(char: Char, desc?: string, attach?: string) {

		const loc = await this.getOrGen(char.at, char);
		if (attach) loc.embed = attach;

		const owner = loc.owner;
		if (owner && owner !== char.name) return 'You do not control this location.';

		if (desc) loc.desc = desc;

		await this.quickSave(loc);

	}

	/**
	 * Get an Npc at Character location.
	 * @param char
	 * @param who
	 */
	async getNpc(char: Char, who: ItemIndex) {
		const loc = await this.getOrGen(char.at, char);
		return loc.getNpc(who);
	}

	/**
	 * Remove Npc at Character location.
	 * @param char
	 * @param who
	 */
	async removeNpcBy(char: Char, who: Mob) {
		const loc = await this.getOrGen(char.at, char);
		return loc.removeNpc(who);

	}

	/**
	 * Remove Npc at Character location.
	 * @param char
	 * @param who
	 */
	async removeNpcAt(at: TCoord, who: Mob) {

		const loc = await this.getLoc(at);
		return loc?.removeNpc(who);

	}

	/**
	 * Attempt to use a feature at the location.
	 * @param char
	 * @param wot
	 */
	async useLoc(char: Char, wot: string | number | Feature) {

		const loc = await this.getOrGen(char.at, char);

		const f = typeof wot !== 'object' ? loc.getFeature(wot) : wot;
		if (!f) {
			char.log('You do not see any such thing here.');
		} else if (!f.use(char)) {
			char.log('Nothing seems to happen.');
		}

	}

	/**
	 * Attempt to take an item from cur location.
	 * @param char
	 * @param first
	 */
	async take(char: Char, first: string | number, end?: string | number | null) {

		const loc = await this.getOrGen(char.at, char);

		const it = (end != null) ? loc.takeRange(first as number, end as number) : loc.take(first);
		if (!it) return 'Item not found.';

		const ind = char.addItem(it);
		await this.quickSave(loc);

		return Array.isArray(it) ? `${char.name} took ${it.length} items.` :
			`${char.name} took ${it.name}. (${ind})`;
	}

	async hike(char: Char, dir: DirString) {

		const coord = char.at;
		let loc: Loc;

		switch (dir) {
			case 'n':
			case 'north':
				loc = await this.getOrGen(new Coord(coord.x, coord.y + 1), char);
				break;
			case 's':
			case 'south':
				loc = await this.getOrGen(new Coord(coord.x, coord.y - 1), char);
				break;
			case 'e':
			case 'east':
				loc = await this.getOrGen(new Coord(coord.x + 1, coord.y), char);
				break;
			case 'w':
			case 'west':
				loc = await this.getOrGen(new Coord(coord.x - 1, coord.y), char);
				break;
			default:
				return;
		}

		return this.move(char, await this.getOrGen(char.at, char), loc);

	}

	/**
	 *
	 * @param char
	 * @returns description of loc maker and time, or error message.
	 */
	async explored(char: Char) {

		const loc = await this.getOrGen(char.at);
		if (loc.maker) return loc.explored();

		loc.setMaker(char.name);
		return 'You are the first to explore ' + loc.coord;

	}

	/**
	 * View feature at location.
	 * @param char 
	 * @param what 
	 * @returns 
	 */
	async viewloc(char: Char, what?: string | number | null) {

		const loc = await this.getOrGen(char.at);
		if (what) {

			const it = loc.getFeature(what);
			if (!it) { return 'You do not see that here.'; }
			return it.getView(char);

		}
		if (loc.embed) return [char.name + ' is' + loc.look(), loc.embed];
		else return char.name + ' is ' + loc.look();

	}

	async view(char: Char, what: string | number) {

		const loc = await this.getOrGen(char.at);

		const it = loc.getNpc(what);
		return it ? it.getDetails() : null;
	}

	/**
	 * Examine item at character location.
	 * @param char
	 * @param what
	 */
	async examine(char: Char, what: string | number) {

		const loc = await this.getOrGen(char.at);
		return loc.get(what)?.getView() ?? null;
	}

	/**
	 * Get Item on ground at coordinate. Does not remove item.
	 * @param at 
	 * @param what 
	 * @returns 
	 */
	async itemAt(at: Coord, what?: ItemIndex | null) {

		if (!what) return null;
		const loc = await this.getLoc(at);
		return loc?.get(what);

	}

	/**
	 *
	 * @param char
	 * @param what
	 */
	async put(char: Char, what: Item) {

		const loc = await this.getOrGen(char.at, char);
		const ind = loc.put(what);
		await this.quickSave(loc);

		return `${char.name} dropped ${what.name}. (${ind})`;

	}

	/**
	 * Attempt to drop an item at cur location.
	 * @param char
	 * @param  what
	 */
	async drop(char: Char, what: ItemPicker, end?: ItemIndex | null) {

		const it = end ? char.removeRange(what as ItemIndex, end) : char.removeItem(what);
		if (!it) return 'Invalid item.';

		const loc = await this.getOrGen(char.at, char);
		const ind = loc.put(it);
		await this.quickSave(loc);

		if (Array.isArray(it)) return it.length + ' items dropped.';
		return `${char.name} dropped ${it.name}. (${ind})`;

	}

	/**
	 *
	 * @param char
	 */
	setHome(char: Char) {

		if (char.home) {
			char.home.setTo(char.at);
		} else char.home = new Coord(char.at.x, char.at.y);

		return `${char.name} Home set.`;

	}

	/**
	 * @param char
	 */
	async goHome(char: Char) {

		let cur = await this.getLoc(char.at);
		cur?.rmChar(char);

		char.at.setTo(char.home ?? new Coord(0, 0));
		cur = await this.getLoc(char.at);
		cur?.addChar(char);

		/// todo: move party? unparty.

		/// public vs private log?
		return char.name + ' has travelled home.';

	}

	/**
	 * Return the new location after moving from the given coordinate.
	 * @param dir - move direction.
	 * @returns new Loc or error string.
	 */
	async move(char: Char, from: Loc, to: TCoord): Promise<Loc> {

		let dest = await this.getLoc(to);
		if (dest == null) {

			const exits = await this.getRandExits(to);
			// must use NEW coord so avoid references.
			dest = GenLoc(new Coord(to.x, to.y), from, exits);
			dest.setMaker(char.name);

			char.addHistory('explore');
			char.addExp(2);

			this.quickSave(dest);

		}

		const feats = dest.features;
		for (let i = feats.length - 1; i >= 0; i--) {
			feats[i].onEnter?.(feats[i], char, dest);
		}

		char.at.setTo(dest.coord);

		from.rmChar(char);
		dest.addChar(char);

		this.trySpawn(dest);

		return dest;

	}

	/**
	 * Attempt to spawn a monster at the given location.
	 * @param loc
	 */
	trySpawn(loc: Loc) {

		if (Math.random() > 0.5 || loc.npcs.length > 4) return;

		const dev = Math.random() - 0.5;
		const lvl = Math.max(Math.floor(loc.norm / 20 + 10 * dev), 0);

		const m = RandMonster(lvl, loc.biome);
		if (!m) return;

		loc.addNpc(m);

		return m;

	}

	async getOrGen(coord: Coord, char?: Char) {

		let loc = await this.getLoc(coord);

		if (loc == null) {

			loc = GenLoc(coord);

			if (char) loc.setMaker(char.name);

			await this.quickSave(loc);

		}

		return loc;

	}

	/**
	 * Attempts to get location without fetching from cache.
	 * @param coord 
	 */
	tryGetLoc(coord: TCoord) {
		const block = this.cache.get(this.getBlockKey(coord)) as Block;
		return block?.getLoc(this.locKey(coord));
	}

	async getLoc(coord: TCoord) {

		const bkey = this.getBlockKey(coord);
		let block = await this.cache.fetch(bkey) as Block;

		if (block) {

			if (!(block instanceof Block)) {
				block = new Block(block);
				this.cache.cache(bkey, block);
			}

			return block.getLoc(this.locKey(coord));
		}

	}

	/**
	 * Get block containing a coordinate.
	 * @param loc 
	 * @param create 
	 * @returns 
	 */
	private async getBlock(loc: TCoord, create: boolean = false) {

		const bkey = this.getBlockKey(loc);
		let block = await this.cache.fetch(bkey);

		if (!block) return (create === true) ? new Block({ key: bkey }) : null;

		if (!(block instanceof Block)) {
			block = new Block(block);
			this.cache.cache(bkey, block);
		}

		return block;

	}

	async quickSave(loc: Loc) {

		const block = await this.getBlock(loc, true);
		if (!block) return;

		block.setLoc(this.coordKey(loc.coord), loc);

		this.cache.cache(block.key, block);
	}

	async forceSave(loc: Loc) {

		const block = await this.getBlock(loc, true);
		if (!block) return;

		block.setLoc(this.coordKey(loc.coord), loc);
		return this.cache.store(block.key, block)

	}

	private locKey(loc: TCoord) {
		return loc.x + ',' + loc.y;
	}

	coordKey(coord: Coord) {
		return coord.x + ',' + coord.y;
	}

	/**
	 */
	private getBlockKey(loc: { x: number, y: number }) {
		return 'rpg/blocks/' +
			Math.floor(loc.x / BLOCK_SIZE) + ',' +
			Math.floor(loc.y / BLOCK_SIZE);
	}


	/**
	 *
	 * @param x
	 * @param y
	 * @returns all exits allowed from this location.
	 */
	private async getRandExits({ x, y }: TCoord) {
		return Promise.all([
			this.getExitTo(new Coord(x - 1, y), 'w'),
			this.getExitTo(new Coord(x + 1, y), 'e'),
			this.getExitTo(new Coord(x, y - 1), 's'),
			this.getExitTo(new Coord(x, y + 1), 'n')]).then(v => v.filter(e => e != null) as Exit[]);


	}

	/**
	 * Returns an exit to the given dest coordinate when arriving
	 * from the given direction.
	 * @param dest - destination coordinate.
	 * @param fromDir - arriving from direction.
	 * @returns
	 */
	async getExitTo(dest: Coord, fromDir: DirVal) {
		const loc = await this.getLoc(dest);
		if (loc) {
			const e = loc.reverseExit(fromDir);
			if (e) return new Exit(fromDir, dest);
			// no exits lead from existing location in this direction.
			return null;
		}
		else if (Math.random() < 0.4) return new Exit(fromDir, dest);	// TODO: this is generation logic.
		return null;
	}

	/**
	* All existing locations adjacent to x,y.
	* @param x
	* @param y
	*/
	/*async getNear(loc: TCoord) {

		return [await this.getLoc(x - 1, y),
		await this.getLoc(x + 1, y),
		await this.getLoc(x, y - 1),
		await this.getLoc(x, y + 1)].filter(v => v != null);

	}*/

}