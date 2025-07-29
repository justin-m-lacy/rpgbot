import { BotContext, type ContextSource } from '@/bot/botcontext';
import type { ChatCommand } from '@/bot/cmd-wrapper';
import Cache from 'archcache';
import { MessageFlags, SendableChannels, User } from "discord.js";
import { ChannelStore } from 'rpg/channel-store';
import { GameActions } from 'rpg/game-actions';
import { type ItemIndex } from 'rpg/items/container';
import { GenName } from 'rpg/namegen';
import { ReviveChar } from 'rpg/parsers/revive-char';
import { NewUserData, type UserData } from 'rpg/users/users';
import { type Char } from './char/char';
import { type Race } from './char/race';
import { Game } from './game';
import { type World } from './world/world';

export const LAST_CHARS = '`lastchars`';

// created for each bot context.
export class Rpg {

	static readonly RpgDir = 'rpg';

	readonly cache: Cache;
	readonly charCache: Cache<Char>;

	/**
	 * Store meta information about users.
	 */
	readonly userCache: Cache<UserData>;

	readonly context: BotContext<any>;

	readonly world: World;
	readonly game: Game<typeof GameActions>;

	/**
	 * Map User id's to name of last char played as.
	 */
	private lastChars!: { [id: string]: string };

	constructor(context: BotContext<ContextSource>) {

		this.context = context;

		this.cache = this.context.subcache(Rpg.RpgDir);
		this.userCache = this.cache.subcache('users');

		this.charCache = this.cache.subcache<Char>('chars', (data) => {

			const char = ReviveChar(this.game, data)!;
			char.events.on('levelUp', this.updateCharInfo, this);
			return char;

		});

		this.game = new Game(this.cache, this.charCache, GameActions);

		this.world = this.game.world;

		//	this.game.events.addListener('levelUp', this.updateCharInfo, this);

	}

	async load() {
		await this.loadLastChars();
		await this.game.load();
	}

	getLastChar(owner: string) { return this.lastChars[owner] }

	async charExists(charname: string) { return this.charCache.exists(this.getCharKey(charname)); }

	async myCharOrErr(m: ChatCommand, user: User) {

		const charId = this.lastChars[user.id];
		if (!charId) {
			m.reply(
				{
					content: `${user.username}: No active character`,
					flags: MessageFlags.Ephemeral
				}
			);
			return null;
		}

		const char = await this.loadChar(charId);
		if (!char) {
			m.reply({
				content: `Error loading '${charId}'. Load new character.`,
				flags: MessageFlags.Ephemeral
			});
			return null;

		} else if (char.owner !== user.id) {
			m.reply({
				content: `You do not control '${charId}'`,
				flags: MessageFlags.Ephemeral
			});
			return null;
		}

		if (m.channel) {
			ChannelStore.set(char, m.channel as SendableChannels);
		}
		return char;

	}

	private async updateCharInfo(char: Char) {

		const userData = await this.getUserData(char.owner);
		if (!userData.chars[char.id]) {
			userData.chars[char.id] ??= {
				id: char.id,
				level: char.level.valueOf()
			}
		} else {
			userData.chars[char.id].level = char.level.valueOf();
		}

	}

	/**
	 * Get per-user level data.
	 * @param user
	 * @returns 
	 */
	async getUserData(userId: string): Promise<UserData> {

		const data = await this.userCache.fetch(userId);
		if (data) return data;

		return await this.userCache.store(userId, NewUserData(userId));

	}

	async loadChar(charname: string) {

		const key = this.getCharKey(charname);
		return this.charCache.get(key) ?? await this.charCache.fetch(key);

	}

	clearUserChar(uid: string) { delete this.lastChars[uid]; }

	/**
	 * Busy work for when char created. Maybe use event.
	 * @param user 
	 * @param char 
	 */
	onCreateChar(user: User, char: Char) {
		this.setUserChar(user, char);
		this.world.addChar(char);
		char.events.on('levelUp', this.updateCharInfo, this);
	}

	async setUserChar(user: User, char: Char) {

		this.lastChars[user.id] = char.name;
		this.cache.cache(LAST_CHARS, this.lastChars);

	}

	private async loadLastChars() {

		const lastjson = await this.cache.fetch(LAST_CHARS);
		if (lastjson) {
			this.lastChars = lastjson;
			return lastjson;
		}
		this.lastChars = {};	// uid->char name
		this.cache.cache(LAST_CHARS, this.lastChars);

	}

	/**
	 * Get char or Monster at Character's location.
	 * @param char 
	 * @param who 
	 */
	async getActor(char: Char, who: ItemIndex) {

		const targ = await this.world.getNpc(char, who);
		if (targ) return targ;
		if (typeof who === 'string') {
			return await this.loadChar(who);
		}

	}


	getCharKey(charname: string) { return charname; }

	cacheChar(char: Char) { this.charCache.cache(this.getCharKey(char.name), char); }

	async saveChar(char: Char, forceSave = false) {

		if (forceSave) return this.charCache.store(this.getCharKey(char.id), char);
		this.charCache.cache(this.getCharKey(char.id), char);

	}

	async uniqueName(race: Race, sex?: string): Promise<string> {

		do {
			const name = GenName(race.name, sex);
			if (name && !(await this.charExists(name))) return name;

		} while (true);

	}

}