import { BotContext, type ContextSource } from '@/bot/botcontext';
import type { ChatAction } from '@/bot/command';
import type { ChatCommand } from '@/bot/wrap-message';
import Cache from 'archcache';
import { User } from "discord.js";
import { InitItems } from 'rpg/builders/itemgen';
import { LoadActions } from 'rpg/magic/action';
import { LoadEffects } from 'rpg/magic/effects';
import { GenName } from 'rpg/namegen';
import { InitClasses, InitRaces } from 'rpg/parsers/classes';
import { Char } from './char/char';
import { Race } from './char/race';
import { Game } from './game';
import { World } from './world/world';

export const LAST_CHARS = '`lastchars`';

// created for each bot context.
export class Rpg {

	static readonly RpgDir = 'rpg';

	readonly cache: Cache;
	readonly charCache: Cache;
	readonly context: BotContext<any>;

	readonly world: World;
	readonly game: Game;

	/**
	 * Map User id's to name of last char played as.
	 */
	private lastChars!: { [id: string]: string };

	constructor(context: BotContext<ContextSource>) {

		this.context = context;

		this.cache = this.context.subcache(Rpg.RpgDir);

		this.game = new Game(this.cache);

		this.charCache = this.game.charCache;
		this.world = this.game.world;

	}

	async load() {
		await this.loadLastChars();
	}

	getLastChar(owner: string) { return this.lastChars[owner] }

	async charExists(charname: string) { return this.charCache.exists(this.getCharKey(charname)); }

	async userCharOrErr(m: ChatCommand, user: User) {

		const charname = this.lastChars[user.id];
		if (!charname) {
			m.reply(`${user.username}: No active character`);
			return null;
		}

		const char = await this.loadChar(charname);
		if (!char) {
			m.reply(`Error loading '${charname}'. Load new character.`);
			return null;

		} else if (char.owner !== user.id) {
			m.reply(`You do not control '${charname}'`);
			return null;
		}
		return char;

	}

	async loadChar(charname: string) {

		const key = this.getCharKey(charname);

		const data = (this.charCache.get(key) ?? await this.charCache.fetch(key)) as Char | undefined;
		data?.init();
		return data;
	}

	clearUserChar(uid: string) { delete this.lastChars[uid]; }

	async setUserChar(user: User, char: Char) {

		this.lastChars[user.id] = char.name;
		this.cache.cache(LAST_CHARS, this.lastChars);

	}

	async loadLastChars() {

		const lastjson = await this.cache.fetch(LAST_CHARS);
		if (lastjson) {
			this.lastChars = lastjson;
			return lastjson;
		}
		this.lastChars = {};	// uid->char name
		this.cache.cache(LAST_CHARS, this.lastChars);

	}

	checkLevel(m: ChatAction, char: Char) {
		if (char.levelFlag) {
			m.reply(char.name + ' has leveled up.');
			char.levelFlag = false;
		}
	}

	getCharKey(charname: string) { return charname; }

	cacheChar(char: Char) { this.charCache.cache(this.getCharKey(char.name), char); }

	async saveChar(char: Char, forceSave = false) {

		if (forceSave) return this.charCache.store(this.getCharKey(char.name), char);
		this.charCache.cache(this.getCharKey(char.name), char);

	}

	async uniqueName(race: Race, sex?: string): Promise<string> {

		do {
			const name = GenName(race.name, sex);
			if (name && !(await this.charExists(name))) return name;

		} while (true);

	}

} // class

/**
 * Preload Rpg data.
 */
export const InitGame = async () => {

	await Promise.all([InitRaces(), InitClasses(), InitItems(), LoadEffects(), LoadActions()]);

}