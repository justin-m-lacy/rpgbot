import type { ChatCommand } from '@/bot/cmd-wrapper';
import ArchCache from 'archcache';
import { Channel, Guild, GuildMember, Message, PermissionResolvable, User, type SendableChannels } from 'discord.js';
import * as afs from '../afs';
import Access from './access';
import BotFs from './botfs';
import { type Command } from './command';
import { DiscordBot } from './discordbot';

/**
 * A discord object associated with this bot context.
 * Commands, classes, and data from this context
 * apply to the Discord ContextSource of the context.
 */
export type ContextSource = Channel | Guild | User;

/**
 * A class whose instances can be registered and associated with a BotContext.
 * A BotContext can have any number of associated ContextClass instances,
 * which pairs them to an underlying discord object such as a User, Guild, or Channel.
 * [ContextClass instances] <-> BotContext <-> ContextSource
 */
export type ContextClass<S extends ContextSource> = {
	new(context: BotContext<S>): any,
	load?(): any
};

/**
 * Base class for a BotContext.
 */
export abstract class BotContext<T extends ContextSource = ContextSource> {

	/**
	 * @property type - 'guild', 'user', 'dm', 'channel'
	 */
	get type() { return 'unknown'; }

	/**
	 *
	 * idObject - discord obj that serves as the base of the context.
	 */
	protected readonly idObject: T;

	/**
	 * @property sourceID - id of the discord object associated with this context.
	 */
	get sourceID() { return this.idObject.id; }

	/**
	 * @property bot
	 */
	readonly bot: DiscordBot;

	readonly cache: ArchCache;

	/**
	 * Maps class-names to class instances.
	 */
	readonly instances: Map<string, InstanceType<ContextClass<T>>> = new Map();

	/**
	 * @property access - Information about access to settings and commands.
	 */
	get access() { return this._access; }
	set access(v) { this._access = v; }

	get afs() { return afs; }
	get botfs() { return BotFs; }

	private _access?: Access;

	/**
	 * @param bot
	 * @param idobj - guild, channel, or user
	 * that acts as the basis for the context.
	 * @param cache
	 */
	constructor(bot: DiscordBot, idobj: T, cache: ArchCache) {

		this.bot = bot;
		this.idObject = idobj;

		this.cache = cache;

	}

	/**
	 * Load Context preferences, init Context classes required
	 * by plugins.
	 * @param classes
	 * @returns
	 */
	async init(classes: ContextClass<T>[]) {

		for (let i = classes.length - 1; i >= 0; i--) {
			this.addClass(classes[i]);
		}

		//const roomPerms = await this.cache.fetch('access');
		//this.access = new Access(roomPerms);

	}

	/**
	 * Send message to a text channel.
	 * @param channelId 
	 * @param message 
	 * @returns 
	 */
	async send(channelId: string, message: string) {
		try {
			const channel = await this.getChannel(channelId);
			if (channel?.isSendable()) {
				return channel.send(message);
			}
		} catch (e) {
			console.warn(e);
		}
	}

	/**
	 * Backup the Context's cache.
	 * @async
	 * @param m
	 * @returns
	 */
	async doBackup() { return this.cache.backup(0); }

	/**
	 * Return access permission string for the given command.
	 * @param cmd
	 * @returns
	 */
	accessInfo(cmd: string) {
		return this.access?.accessInfo(cmd);
	}

	/**
	 *
	 * @param cmd
	 */
	unsetAccess(cmd: string) {
		this.access?.unsetAccess(cmd);
	}

	/**
	 *
	 * @param cmd
	 * @param perm
	 * @returns
	 */
	setAccess(cmd: string, perm: PermissionResolvable) {
		return this.access?.setAccess(cmd, perm);
	}

	/**
	 *
	 * @param cmd
	 */
	getAccess(cmd: string) {
		return this.access?.getAccess(cmd);
	}

	/**
	 *
	 * @param cmd
	 * @param gm
	 * @returns
	 */
	canAccess(cmd: string, gm: GuildMember) {
		return this._access?.canAccess(cmd, gm);
	}

	/**
	 * Save this context's command permissions.
	 * @async
	 * @returns
	 */
	async savePerms() {
		await this.cache.store('access', this.access);
	}

	/**
	 * Cache access without forcing write to disk.
	 */
	cachePerms() {
		this.cache.cache('access', this.access);
	}

	/**
	 * @param key
	 * @param value
	 * @returns
	 */
	async setSetting(key: string, value?: any) {

		const settings = await this.cache.fetch('settings') ?? {};

		settings[key] = value;
		this.cache.cache('settings', value);

	}

	/**
	 * @param key
	 * @param defaultset - value to return if setting not found.
	 * @returns
	 */
	async getSetting(key: string, defaultset?: string) {

		const settings = await this.cache.fetch('settings');

		if (!settings || !settings.hasOwnProperty(key)) return defaultset;
		return settings[key];

	}

	/**
	 * Tests if a file name or cache-key is illegal.
	 * @param s
	 * @returns
	 */
	isValidKey(s: string) {

		const a = BotFs.illegalChars;
		for (let i = a.length - 1; i >= 0; i--) {
			if (s.indexOf(a[i]) >= 0) return false;
		}
		return true;

	}

	/**
	 * Check if Discord User is the bot owner.
	 * @param u
	 * @returns
	*/
	isOwner(u: User | string) { return this.bot.isOwner(u); }

	/**
	 * Returns an array of all files stored at a data path.
	 * ( path is relative to the context's save directory. )
	 * File extensions are not included.
	 * @async
	 * @param path
	 * @returns
	 */
	async getDataList(path: string): Promise<string[]> {

		const extRegex = /.[^/.]+$/;
		const files = await afs.readFiles(BotFs.BaseDir + this.cache.cacheKey + path);
		for (let i = files.length - 1; i >= 0; i--) {

			// remove file extension.
			files[i] = files[i].replace(extRegex, '');

		}

		return files;

	}

	/**
	 * Displays standard user not found message to the given
	 * channel.
	 * @param  obj
	 * @param  user
	 */
	private sendUserNotFound(obj: SendableChannels | Message<true>, user: string) {

		if (obj instanceof Message) return obj.reply('User \'' + user + '\' not found.');
		else if (obj.isSendable()) obj.send('User \'' + user + '\' not found.');

	}

	/**
	 * Attempts to find a user in the given Context.
	 * An error message is sent on failure.
	 */
	private userOrSendErr(resp: SendableChannels | Message<true>, name?: string) {

		if (!name) {
			(resp instanceof Message) ? resp.reply('User name expected.') : resp.send('User name expected.');
			return null;
		}
		const user = this.findUser(name);
		if (!user) this.sendUserNotFound(resp, name);

		return user;

	}

	/**
	 * @async
	 * @param id - discord user id.
	 * @return
	 */
	async displayName(id?: string) {

		if (!id) return 'Invalid ID';

		try {
			return (await this.bot.client.users.fetch(id)).username;
		} catch {
		}
		return "Unknown User";

	}

	/**
	 * Get a display name for user.
	 * @param o
	 * @returns
	 */
	userString(o: string | User | GuildMember) {

		if (typeof o === 'string') return o;
		if (o instanceof User) return o.username;
		if (o instanceof GuildMember) return o.displayName;

	}

	async getUser(id: string) {
		try {
			/// fetch checks cache first.
			return await this.bot.client.users.fetch(id);
		} catch {
			return null;
		}
	}

	async getChannel(id: string) {
		/// fetch checks cache first.
		return this.bot.client.channels.resolve(id) ?? await this.bot.client.channels.fetch(id);
	}

	/**
	 * Override in botcontext subclasses to find named user within context.
	 * @param name
	 * @returns overridden in subclasses.
	 */
	findUser(name: string): User | GuildMember | null {

		name = name.toLowerCase();
		return this.bot.client.users.cache.find(v => v.username === name) ?? null;

	}



	/**
	 * Find channel by name. (Not channel Id.)
	 * @param name
	 */
	findChannel(name: string): Channel | null {
		return null;
	}

	/**
	 * Adds a class to be instantiated for the given context,
	 * if an instance does not already exists.
	 * @async
	 * @param cls
	 * @returns
	 */
	async addClass(cls: ContextClass<T>): Promise<InstanceType<ContextClass<T>>> {

		if (this.instances.get(cls.name)) {
			console.log('class ' + cls.name + ' already exists for ' + this.idObject.id);
			return this.instances.get(cls.name)!;
		}

		const inst = new cls(this);

		if ('load' in inst && typeof inst.load === 'function') {
			await inst.load();
		}

		this.instances.set(cls.name, inst);

		return inst;

	}


	/**
	 * Add a context instance.
	 * @param inst - plugin instance for this context.
	 */
	addInstance(inst: ContextClass<T>) {
		this.instances.set(inst.constructor.name, inst);
	}

	/**
	 * @async
	 * @param cmd
	 * @param args
	 * @returns
	 */
	async routeCommand(it: ChatCommand, cmd: Command<object>, ...args: any[]) {

		let target = this.instances.get(cmd.cls.name);
		if (!target) {
			target = await this.addClass(cmd.cls);
			if (!target) {
				console.error('Missing command target: ' + cmd.cls);
				return null;
			}
		}

		return cmd.exec(it, target, ...args);

	}

	/**
	 * Create a context subcache mapped by key.
	 * @param key
	 * @returns The Cache object.
	 */
	subcache(key: string) { return this.cache.subcache(key); }

	/**
	 * Returns the key which should be used to refer to a data path in the cache.
	 * @param objs - objs are idables or cache path strings.
	 * @returns
	 */
	getDataKey(...objs: Array<string | { id: string }>) {
		return objs.map(v => typeof v == 'string' ? v : v.id).join('/');
	}

	/**
	 * @async
	 * @param key
	 * @returns
	 */
	async deleteData(key: string) {
		return this.cache.delete(key);
	}

	/**
	 * Caches data without writing to disk.
	 * @param key
	 * @param data
	 */
	cacheData(key: string, data: any) {
		this.cache.cache(key, data);
	}

	/**
	 * Attempts to retrieve data from cache without
	 * checking backing store.
	 * @param key
	 * @returns
	 */
	getData(key: string) { return this.cache.get(key); }

	/**
	 * Fetch keyed data.
	 * @param key
	 * @returns
	 */
	async fetchData(key: string) { return this.cache.fetch(key); }

	/**
	 * Set keyed data.
	 * @param key
	 * @param data
	 * @param [forceSave=false] Whether to force a save to the underlying data store.
	 * @returns
	 */
	async storeData(key: string, data: any, forceSave: boolean = false) {

		if (forceSave) return this.cache.store(key, data);
		else return this.cache.cache(key, data);

	}

}

export class UserContext extends BotContext<User> {

	get type() { return 'user'; }

	get name() { return this.idObject.username; }

	async getChannel(s: string) {
		return this.idObject.dmChannel;
	}

	/**
	 *
	 * @param name
	 */
	findUser(name: string) {

		if (this.idObject.username.toLowerCase() === name.toLowerCase()) {
			return this.idObject;
		}
		return null;

	}

}

export class GuildContext extends BotContext<Guild> {

	get type() { return 'guild'; }

	get name() { return this.idObject.name; }

	/**
	 * @param id
	 */
	async displayName(id: string) {

		if (!id) return 'Invalid ID';

		try {
			/// Note: fetch() takes caching into account.
			return (await this.idObject.members.fetch(id)).displayName;
		} catch (e) { }

		return 'Unknown User';

	}

	async getChannel(id: string) {

		/// fetch checks cache first.
		return this.idObject.channels.resolve(id) ?? await this.idObject.channels.fetch(id);
	}


	/**
	 * Find channel by name.
	 * @param name 
	 * @returns 
	 */
	findChannel(name: string) {

		name = name.toLowerCase();
		return this.idObject.channels.cache.find(c => c.name.toLowerCase() === name) ?? null;
	}

	/**
	 *
	 * @param name - GuildMember display name of user to find.
	 */
	findUser(name: string) {

		name = name.toLowerCase();
		return this.idObject.members.cache.find(gm =>
			gm.displayName.toLowerCase() === name || gm.nickname?.toLowerCase() === name || gm.user.username === name || gm.id === name
		) ?? null;

	}

}