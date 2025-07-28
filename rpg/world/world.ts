import { Capitalize } from '@/utils/display';
import { GenFeature } from 'rpg/builders/features';
import { GenShop } from 'rpg/builders/shopgen';
import { ItemList } from 'rpg/display/items';
import { ItemType } from 'rpg/items/types';
import { RandMonster } from 'rpg/parsers/mobs';
import { ICache } from 'rpg/util/icache';
import { Coord, TCoord } from 'rpg/world/coord';
import { GenLoc } from 'rpg/world/worldgen';
import type { Char } from '../char/char';
import type { Mob } from '../char/mobs';
import type { Game } from '../game';
import { ItemIndex, ItemPicker } from '../items/container';
import type { Item } from '../items/item';
import { Block } from './block';
import type { Feature } from './feature';
import { Biome, DirVal, Exit, Loc, ToDirStr } from './loc';

// Locations are merged into blocks of width/block_size, height/block_size.
// WARNING: Changing block size will break the fetching existing world data.
const BLOCK_SIZE = 16;

export class World {

	readonly cache: ICache<Block>;
	readonly chars: ICache<Char>

	constructor(blockCache: ICache<Block>, chars: ICache<Char>) {

		this.cache = blockCache;
		this.chars = chars;

	}

	async init() {
		const st = await this.getOrGen(new Coord(0, 0));
		if (!st.getFeature('shrine')) {
			st.addFeature(GenFeature('shrine'));
		}
		if (!st.features.some(f => {
			return f.type === ItemType.Shop
		})) {
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

		const owner = loc.owner;
		if (owner && owner !== char.id) return 'You do not control this location.';

		if (desc) loc.desc = desc;
		if (attach) loc.embed = attach;

		return this.quickSave(loc);

	}

	/**
	 * Get an Npc at Character location.
	 * @param char
	 * @param who
	 */
	async getNpc(char: Char, who: ItemIndex) {
		// generate b/c if char loc is invalid and player attacks, e.g,
		// npc 1, that npc could exist in generated loc.
		return (await this.getOrGen(char.at, char)).getNpc(who);
	}

	/**
	 * Remove Npc at Character location.
	 * @param char
	 * @param who
	 */
	async removeNpcBy(char: Char, who: Mob) {
		return (await this.fetchLoc(char.at))?.removeNpc(who);
	}

	/**
	 * Remove Npc at Character location.
	 * @param char
	 * @param who
	 */
	async removeNpcAt(at: TCoord, who: Mob) {
		return (await this.fetchLoc(at))?.removeNpc(who);
	}

	/**
	 * Attempt to use a feature at the location.
	 * @param char
	 * @param wot
	 */
	async useLoc(game: Game, char: Char, wot: string | number | Feature) {

		const f = typeof wot !== 'object' ? (await this.getOrGen(char.at, char)).getFeature(wot) : wot;
		if (!f) {
			char.log('You do not see any such thing here.');
		} else {
			f.use(game, char);
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
		if (loc.embed) return [this.look(loc, char), loc.embed];
		else return this.look(loc, char);

	}


	/**
	 * Returns text seen by character looking at location.
	 * @param char - char looking
	 * @param imgTag 
	 * @param showPaths 
	 * @returns 
	 */
	look(loc: Loc, char?: Char, imgTag: boolean = true, showPaths: boolean = false) {

		let r = (char ? char.name + ' is' : '') + in_prefix[loc.biome as Biome] + Capitalize(loc.biome) + (char ? ` [${char.state}]` : '');

		if (loc.embed && imgTag) r += ' [img]';
		r += '\n' + loc.desc;

		if (loc.features.length > 0) r += '\nFeatures: ' + ItemList(loc.features);
		r += '\nground: ' + ItemList(loc.inv);

		if (loc.chars.length > 0) {

			r += '\nchars: ' + loc.charList();

			const minions: string[] = [];
			for (let i = loc.chars.length - 1; i >= 0; i--) {
				const char = this.chars.get(loc.chars[i]);
				if (char?.minions.length) {
					minions.push(...char.minions.map(v => `${v.name} [${char.name}]`))
				}
			}
			if (minions.length > 0) r += `\nMinions: ` + minions.join(', ');

		}

		if (loc.npcs.length > 0) {
			r += '\ncreatures: ' + loc.npcList();
		}

		if (showPaths) {
			r += '\nPaths:'
			for (const k in loc.exits) {
				r += '\t' + ToDirStr(k as DirVal);
			}
		}

		return r;

	}

	async view(char: Char, what: string | number) {
		return (await this.getOrGen(char.at)).getNpc(what)?.getDetails();
	}

	/**
	 * Examine item at character location.
	 * @param char
	 * @param what
	 */
	async examine(char: Char, what: string | number) {
		return (await this.getOrGen(char.at)).get(what)?.getView() ?? null;
	}

	/**
	 * Get Item on ground at coordinate. Does not remove item.
	 * @param at 
	 * @param what 
	 * @returns 
	 */
	async itemAt(at: Coord, what: ItemIndex) {
		return (await this.fetchLoc(at))?.get(what);
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
	 * @param char
	 */
	async goHome(char: Char) {

		await this.move(char, await this.getOrGen(char.at, char), char.home ?? { x: 0, y: 0 });
		/// todo: move party? unparty.
		/// public vs private log?
		return char.name + ' has travelled home.';

	}

	/**
	 * Force char without fail to new coordinate.
	 * @param dir - move direction.
	 * @returns New character location.
	 */
	async move(char: Char, from: Loc, to: TCoord): Promise<Loc> {

		let dest = await this.fetchLoc(to);
		if (dest == null) {

			const exits = await this.getRandExits(to);
			// must use NEW coord so avoid references.
			dest = GenLoc(to, from, exits);
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
	 * Add char to current world location.
	 * @param char 
	 */
	async addChar(char: Char) {
		(await this.getOrGen(char.at)).addChar(char);
	}

	/**
	 * Attempt to spawn a monster at the given location.
	 * @param loc
	 */
	trySpawn(loc: Loc) {

		if (Math.random() > 0.4 || loc.npcs.length > 4) return;

		const dev = Math.random() - 0.5;
		const lvl = Math.max(Math.floor(loc.norm / 20 + 10 * dev), 0);

		const m = RandMonster(lvl, loc.biome);
		if (!m) return;

		loc.addNpc(m);

		return m;

	}

	async getOrGen(coord: TCoord, char?: Char) {

		let loc = await this.fetchLoc(coord);

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
	getLoc(coord: TCoord) {
		const block = this.cache.get(this.getBlockKey(coord));
		return block?.getLoc(this.locKey(coord));
	}

	async fetchLoc(at: TCoord) {

		const bkey = this.getBlockKey(at);
		return (await this.cache.fetch(bkey))?.getLoc(this.locKey(at))

	}

	async quickSave(loc: Loc) {

		const block = await this.getBlock(loc, true);
		if (!block) return;

		block.setLoc(this.locKey(loc.coord), loc);

		this.cache.cache(block.key, block);
	}

	async forceSave(loc: Loc) {

		const block = await this.getBlock(loc, true);
		if (!block) return;

		block.setLoc(this.locKey(loc.coord), loc);
		return this.cache.store(block.key, block)

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

	private locKey(loc: TCoord) {
		return loc.x + ',' + loc.y;
	}

	/**
	 */
	private getBlockKey(loc: { x: number, y: number }) {
		return 'block_' +
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
		const loc = await this.fetchLoc(dest);
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


const in_prefix: { [Property in Biome]: string } = {
	[Biome.FOREST]: ' in a ',
	[Biome.TOWN]: ' in a ',
	[Biome.SWAMP]: ' in a ',
	[Biome.PLAINS]: ' on the ',
	[Biome.HILLS]: ' in the ',
	[Biome.MOUNTAIN]: ' in the ',
	[Biome.UNDER]: ' '
};