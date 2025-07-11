import { CmdParser } from '@/bot/cmd-parser';
import { MsgWrap, type ChatCommand } from '@/bot/cmd-wrapper';
import Cache from 'archcache';
import { Channel, ChannelType, Client, Events, Guild, GuildMember, Message, MessageFlags, User, type Interaction, type SendableChannels } from 'discord.js';
import path from 'path';
import { Auth } from './bot/auth';
import { BotContext, ContextClass, ContextSource, GuildContext, UserContext } from './bot/botcontext';
import fsys from './bot/botfs';
import { IsTypedCmd, type Command } from './bot/command';
import { CommandMap } from './bot/command-map';
import { Display } from './utils/display';

export type TBotConfig = {

	cmdprefix: string,
	spamblock: Record<string, Record<string, boolean>>,
	pluginsdir: string,
	savedir: string,

}

/**
 * maximum message size.
 */
export const CONTENT_MAX = 1905;

export type TCmdFunc<S extends string = string> = (m: Message<true>, ...rest: S[]) => any;

export class DiscordBot {

	readonly client: Client;

	private readonly cache: Cache;

	/**
	 * Map ContextSource ids to BotContexts associated with those Discord objects.
	 */
	private readonly contexts: Map<string, BotContext<Guild | User | Channel>> = new Map();

	/**
	 * Maps proxyId(userId) -> proxiedId
	 * the key represents the object acting as a proxy for the actual discord context.
	 * usually works as: proxies[userId]->GuildId
	 * Commands in user DM are mapped to the guild BotContext.
	 */
	private readonly _proxies: Map<string, string> = new Map();

	/**
	 * classes to instantiate for each context.
	 */
	private readonly ctxClasses: ContextClass<ContextSource>[] = [];

	/**
	 * prefix that indicates an archbot command.
	 */
	readonly cmdPrefix: string;

	/**
	 * The working directory of the program. defaults to the directory of the main script file.
	 */
	private readonly baseDir: string;

	/**
	 * Base save directory.
	 * Late-loaded from config.
	 */
	private readonly saveDir: string;

	private readonly owner: string;
	private readonly admins?: string[];

	private readonly spamblock: Record<string, Record<string, boolean>>;

	private readonly commands: ReturnType<typeof CommandMap> = CommandMap();

	// bot user id.
	private botId: string | null = null;

	/// parser for raw-message commands.
	private readonly parser: CmdParser = new CmdParser();

	/**
	 *
	 * @param client
	 * @param auth - authentication information object.
	 * @param auth.owner - owner of bot.
	 * @param auth.admins - accounts with authority to control bot.
	 * @param mainDir - main directory of the bot program.
	 * 	Defaults to the directory of the main script
	 */
	constructor(client: Client, auth: Auth, config: Partial<TBotConfig>, mainDir?: string) {

		this.baseDir = mainDir || process.cwd();

		// classes to instantiate for each context.
		this.ctxClasses = [];

		this.client = client;

		this.spamblock = config.spamblock ?? {};
		this.cmdPrefix = config.cmdprefix ?? '!';

		console.log(`pref: ${this.cmdPrefix}`);

		this.saveDir = path.join(this.baseDir, config.savedir || '/savedata/');

		fsys.setBaseDir(this.saveDir);

		this.cache = new Cache({
			cacheKey: '',
			loader: fsys.readData,
			saver: fsys.writeData,
			checker: fsys.fileExists,
			deleter: fsys.deleteData

		});

		this.admins = auth.admins;
		this.owner = auth.owner;

		this.restoreProxies();
		this.initBotEvents();

	}

	private initBotEvents() {

		process.on('exit', () => this.onShutdown());
		process.on('SIGINT', () => this.onShutdown());

		setInterval(
			() => {
				this.cache.cleanup(60 * 1000 * 30);
			}, 60 * 1000 * 30).unref();

		setInterval(
			() => {
				this.cache.backup(1000 * 10).catch(err => console.error(err));
			}, 1000 * 10).unref();

		this.initClient();

	}

	/**
	 * @async
	 */
	private async onShutdown() {
		if (this.client) {
			await this.cache.backup();
			this.client.destroy();
		}
		process.exit(1);
	}

	/**
	 * Add class that will be instantiated on every running
	 * context.
	 * @param cls
	 */
	addContextClass(cls: ContextClass<ContextSource>) {

		this.ctxClasses.push(cls);

		// ensure context for every guild.
		if (this.client) {

			this.client.guilds.cache.forEach((g, id) => {

				this.getContext(g, ChannelType.GuildText).then(c => {
					c?.addClass(cls);
				});

			});

		}

	}

	initClient() {

		// NOTE: 'this' for events is always client.
		this.client.on(Events.ClientReady, () => this.initContexts());
		this.client.on(Events.GuildUnavailable, onGuildUnavail)

		this.client.on(Events.ShardResume, onResume);

		this.client.on(Events.InteractionCreate, async (it) => {

			try {

				if (it.isChatInputCommand()) {
					const cmd = this.commands.get(it.commandName);
					if (!cmd) return;

					if (IsTypedCmd(cmd)) {

						const ctx = await this.getCmdContext(it);
						ctx?.routeCommand(it, cmd);

					} else {
						await cmd.exec(it, this);
					}

				} else if (it.isButton()) {

					const wrap = this.commands.parseButton(it);
					if (!wrap) return;

					if (IsTypedCmd(wrap.cmd)) {

						const ctx = await this.getCmdContext(it);
						ctx?.routeCommand(wrap, wrap.cmd);

					} else {
						await wrap.cmd.exec(wrap, this);
					}

				}


			} catch (e) {
				console.error(e);
			}
		});

		this.client.on(Events.MessageCreate, (m) => {

			if (m.author.id === this.botId) return;
			if (!m.content.startsWith(this.cmdPrefix)) return;

			if (this.isSpam(m)) return;

			try {
				const ind = m.content.indexOf(' ');
				const cmdStr = ind < 0 ? m.content.slice(1) : m.content.slice(1, ind);

				const cmd = this.commands.get(cmdStr);
				if (cmd) this.onMessage(m, cmd, ind > 0 ? m.content.slice(ind + 1) : '');
			} catch (e) {
				console.error(e);
			}

		})

	}

	private async onMessage(m: Message, cmd: Command, argLine: string) {

		try {

			const args = this.parser.parse(argLine, cmd);
			const wrap = new MsgWrap(m, args);

			const ctx = await this.getCmdContext(m);
			if (ctx) {


				if ('cls' in cmd) {
					await ctx.routeCommand(wrap, cmd);
				}

			} else {
				await cmd.exec(wrap, this);
			}

		} catch (err) {
			console.warn(err);
		}

	}

	private initContexts() {

		console.log('client ready: ' + this.client.user!.username + ' - ('
			+ this.client.user?.id + ')');

		try {
			const classes = this.ctxClasses;
			if (classes.length === 0) {
				return;
			}

			this.botId = this.client.user!.id;

			this.client.guilds.cache.forEach((g, id) => {
				this.getContext(g);
			});
		} catch (e) { console.log(e); }

	}

	/**
	 * add command to bot.
	 * @param cmd 
	 */
	public addCommand(cmd: Command) {
		this.commands.set(cmd.data.name, cmd);
	}

	public addCommands(cmds: Command[]) {
		for (let i = cmds.length - 1; i >= 0; i--) {
			this.commands.set(cmds[i].data.name, cmds[i]);
		}
	}

	/**
	 * Returns true if discord user is the bot owner.
	 * @param u
	 */
	public isOwner(u: User | string) {

		if (typeof u !== 'string') u = u.id;
		return u === this.owner || this.admins?.includes(u);
	}

	/**
	 * Backup unsaved cache items.
	 * @async
	 * @param m
	 */
	public async backup(u: User) {

		if (this.isOwner(u)) {
			await this.cache.backup(0);
			return true;
		} else /// per-context backup?
			return false;

	}

	/**
	 * Close the running Archbot program. Owner only.
	 * @async
	 * @param m
	 * @returns
	 */
	public async shutdown(u: User) {

		if (this.isOwner(u)) {
			this.client.destroy();
			return true;
		}
		return false;

	}

	/**
	 * Make Archbot leave guild.
	 * @async
	 * @param m
	 * @returns
	 */
	public async leaveGuild(m: ChatCommand) {

		if (this.isOwner(m.user.id) && m.guild) {
			await m.guild.leave();
			return true;
		}
		return false;

	}

	/**
	 * @returns return true to block bot by guild/channel message.
	 */
	private isSpam(m: Message) {

		if (!m.guild) return false;
		const block = this.spamblock[m.guild.id];
		return (m.channel && block?.[m.channel.id]);

	}

	/**
	 * Test if user can access command.
	 * @param m
	 * @param cmd
	 * @param context
	 */
	private hasAccess(m: Message, cmd: Command, context: BotContext<ContextSource>) {

		if (m.member) {

			const allowed = context.canAccess(cmd.id, m.member);
			if (allowed === undefined) {

				// check default access.
				//if (!cmd.access) return true;
				//return m.member.permissions.has(cmd.access);

			}
			return allowed;
		}

	}

	/**
	 * Proxy current context to the user's DM.
	 * @async
	 * @param m
	 * @returns
	 */
	public async makeProxy(m: ChatCommand) {

		// get context of the guild/channel to be proxied to user.
		const context = await this.getCmdContext(m);

		if (context) {
			this.setProxy(m.user, context as GuildContext | BotContext<Channel>);
			return true;
		}
		return false;

	}

	/**
	 * Reset command's permissions to default.
	 * @async
	 * @param it
	 * @param cmd - name of command.
	 * @returns
	 */
	async resetCommandAccess(it: ChatCommand, cmd: string) {

		const context = await this.getCmdContext(it);

		if (context) {
			// unset any custom access.
			context.unsetAccess(cmd);
			return true;
		}
		return false;

	}

	/**
	 * Proxy a Context to a user's PM.
	 * @param user
	 * @param context
	 */
	public setProxy(user: User, context: BotContext<Guild | Channel>) {

		//this._contexts.set(user.id, context);
		this._proxies.set(user.id, context.sourceId);
		this.cacheData('proxies', this._proxies);

	}

	/**
	 * Save information about proxied contexts.
	 * @async
	 * @returns
	 */
	private async saveProxies() {
		return this.storeData('proxies', this._proxies);
	}

	/**
	 * Restore proxies defined in proxies file.
	 * @async
	 * @returns
	 */
	private async restoreProxies() {

		try {
			const loaded = await this.fetchData('proxies');
			if (loaded) {

				for (const key in loaded) {
					this._proxies.set(key, loaded[key]);
				}

			}
		}
		catch (err) {
			console.warn(`Error restoring proxies: ${err}`);
		}

	}

	private async getCmdContext(it: Interaction | Message | ChatCommand) {

		let idObj: Guild | User | null;

		if (it.inGuild()) {
			idObj = it.guild;
		} else {

			idObj = (it as Message).author || (it as Interaction).user;
			//check proxy
			if (this._proxies.has(idObj.id)) {
				return this.getProxiedCtx(idObj);
			}

		}

		if (idObj != null) {
			return this.contexts.get(idObj.id) ?? this.makeContext(idObj);
		}

	}

	/**
	 * Get or create BotContext associated with a Discord object.
	 * @returns
	 */
	async getContext(idobj: ContextSource, type?: ChannelType) {

		if (this._proxies.has(idobj.id)) {
			return this.getProxiedCtx(idobj);
		}

		return this.contexts.get(idobj.id) ?? this.makeContext(idobj);

	}

	/**
	 * Get the BotContext proxied to another channel.
	 * e.g. a Guild's BotContext being proxied to a user's DM.
	 * @param proxy - object acting as the actual proxied object.
	 * This will typically be a User's DM channel.
	 * @returns
	 */
	private async getProxiedCtx(proxy: ContextSource) {

		/// id of Discord object being proxied.
		const sourceId = this._proxies.get(proxy.id);

		if (sourceId) {
			const con = this.contexts.get(sourceId);
			if (con) return con;

			const proxob = await this.findDiscordObject(sourceId);
			if (proxob) return this.makeContext(proxob);

			// proxy not found.
			console.warn(`Error: Proxy target not found: ${sourceId}`);
			return this.contexts.get(proxy.id) ?? this.makeContext(proxy);
		}

	}

	/**
	 * Get the object associated with a Discord id.
	 * @param id
	 * @returns
	 */
	async findDiscordObject(id: string) {
		return await this.client.guilds.fetch(id) || await this.client.channels.fetch(id);
	}

	/**
	 * @async
	 * @param idobj
	 * @param type
	 * @returns
	 */
	async makeContext(idobj: ContextSource): Promise<BotContext | undefined> {

		let context: BotContext | undefined;

		if (idobj instanceof Guild) {
			//console.log(`new context: ${idobj.name}: ${idobj.id}`);
			context = new GuildContext(this, idobj as Guild, this.cache.subcache(fsys.getGuildDir(idobj)));
		} else if (idobj instanceof User) {
			context = new UserContext(this, idobj as User, this.cache.subcache(fsys.getUserDir(idobj)));
		} else {
			console.log(`no context type: ${idobj.type}`)
		}

		if (context) {
			await context.init(this.ctxClasses);
			this.contexts.set(idobj.id, context);
		}

		return context;

	}

	/**
	 * Gets a displayName for a discord user.
	 * @param uObject
	 * @returns
	 */
	displayName(uObject: GuildMember | User) {
		if (uObject instanceof GuildMember) {
			return uObject.displayName;
		}
		return uObject.username;

	}

	/**
	 * Get the sender of a Message.
	 * @param msg
	 * @returns
	 */
	getSender(msg: Message) {
		return msg.member || msg.author;
	}

	/**
	 * fetch data for arbitrary key.
	 * @async
	 * @param key
	 * @returns
	 */
	async fetchData(key: string) {
		return this.cache.fetch(key);
	}

	/**
	 * Store data for key.
	 * @async
	 * @param key
	 * @param data
	 * @returns
	 */
	async storeData(key: string, data: any) {
		return this.cache.store(key, data);
	}

	/**
	 * Create a key to associate with a chain of Discord objects.
	 * @param baseObj
	 * @param subs
	 * @returns
	 */
	getDataKey(baseObj: Channel | GuildMember | Guild, ...subs: any[]) {

		if ('type' in baseObj) return fsys.channelPath(baseObj, subs);
		else if (baseObj instanceof GuildMember) return fsys.guildPath(baseObj.guild, subs);
		else if (baseObj instanceof Guild) return fsys.guildPath(baseObj, subs);

		return '';

	}

	/**
	 *
	 * @param key
	 * @param data
	 */
	cacheData(key: string, data: any) {
		this.cache.cache(key, data);
	}

	/**
	 * @async
	 * @param uObject
	 * @returns
	 */
	private async fetchUserData(uObject: GuildMember | User) {

		return this.cache.fetch(
			(uObject instanceof GuildMember) ? fsys.memberPath(uObject)
				: fsys.getUserDir(uObject)
		);

	}

	/**
	 *
	 * @param uObject
	 * @param data - user data to store.
	 */
	private storeUserData(uObject: User | GuildMember, data: any) {

		const objPath = (uObject instanceof GuildMember) ? fsys.memberPath(uObject) :
			fsys.getUserDir(uObject);

		return this.cache.cache(objPath, data);

	}

	/**
	 * Finds and returns the named user in the channel,
	 * or replies with an error message.
	 * Function is intentionally not async since there is no reason
	 * to wait for the channel reply to go through.
	 * @param channel
	 * @param name
	 * @returns 
	 */
	userOrSendErr(channel: SendableChannels, name?: string) {

		if (!name) {
			channel.send('User name expected.');

		} else {
			const member = this.findUser(channel, name);
			if (!member) channel.send('User \'' + name + '\' not found.');
			return member;
		}

	}

	/**
	 * Find a GuildMember or User object in channel.
	 * @param channel
	 * @param name - name or nickname of user to find.
	 * @returns
	 */
	findUser(channel: SendableChannels, name: string) {

		if (!channel) return null;

		name = name.toLowerCase();
		switch (channel.type) {

			case ChannelType.DM:
				if (channel.recipient?.username.toLowerCase() === name) return channel.recipient;
				return null;
			default:
				const search = channel.guild.members.cache.find(

					(gm) => gm.displayName.toLowerCase() === name ||
						gm.nickname?.toLowerCase() === name

				);
				if (search) {

					return search;
				} else {
					/// Check raw usernames.
					return channel.guild.members.cache.find((gm) => gm.user.username.toLowerCase() === name);

				}

		}

	}

	/**
	 * @async
	 * @param chan
	 * @param cmdname
	 * @returns
	 */
	async printCommand(chan: ChatCommand, cmdname: string, page: number = 0) {

		const cmdInfo = this.commands.get(cmdname);
		if (cmdInfo) {

			const usage = cmdInfo.data.description;
			if (!usage) return chan.reply({
				content: 'No usage information found for command \'' + cmdname + '\'.',
				flags: MessageFlags.Ephemeral
			});
			else return chan.reply({
				content: cmdname + ' usage: ' + usage,
				flags: MessageFlags.Ephemeral
			});


		} else return chan.reply({
			content: 'Command \'' + cmdname + '\' not found.',
			flags: MessageFlags.Ephemeral
		});

	}


	/**
	 * @async
	 * @param chan
	 * @returns
	 */
	async printCommands(chan: ChatCommand, page: number = 0) {

		const parts: string[] = [
			`Use ${this.cmdPrefix}help [command] for more information.\nAvailable commands:\n`
		];

		const sep = ': ' + this.cmdPrefix;

		for (const [k, cmd] of this.commands.entries()) {

			if (!cmd.hidden) parts.push(k + sep + cmd.data.description);

		} //

		return Display.sendPage(chan, parts.join('\n'), page);


	}

} // class

const onGuildUnavail = (g: Guild) => {
	console.log('guild unavailable: ' + g.name);
}

const onResume = (evtCount: number) => {
	console.log(`resuming. missed ${evtCount} events.`);
}