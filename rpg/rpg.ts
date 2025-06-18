import { BotContext, type ContextSource } from '@/bot/botcontext';
import type { ChatAction } from '@/bot/command';
import Cache from 'archcache';
import { User } from "discord.js";
import { GenName } from 'rpg/namegen';
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

	async userCharOrErr(m: ChatAction, user: User) {

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

/*export const InitGame = async (bot: DiscordBot) => {

	await Promise.all([InitRaces(), InitClasses(), InitItems(), LoadEffects(), LoadActions()])

	const proto = Rpg.prototype;

	// CHAR MANAGEMENT
	bot.addContextCmd('rollchar', 'rollchar [charname] [racename] [classname]', proto.cmdRollChar, Rpg, { maxArgs: 4 });

	bot.addContextCmd('loadchar', 'loadchar <charname>', proto.cmdLoadChar, Rpg, { maxArgs: 1 });
	bot.addContextCmd('savechar', 'savechar', proto.cmdSaveChar, Rpg, { maxArgs: 0 });

	bot.addContextCmd('viewchar', 'viewchar <charname>', proto.cmdViewChar, Rpg, { maxArgs: 1 });
	bot.addContextCmd('rmchar', 'rmchar <charname>', proto.cmdRmChar, Rpg, { minArgs: 1, maxArgs: 1 });
	bot.addContextCmd('charstats', 'charstats [charname]', proto.cmdCharStats, Rpg, { minArgs: 0, maxArgs: 1 });
	bot.addContextCmd('talents', 'talents [charname]', proto.cmdTalents, Rpg, { minArgs: 0, maxArgs: 1 });

	bot.addContextCmd('addstat', 'addstat [statname]', proto.cmdAddStat, Rpg, { minArgs: 1, maxArgs: 1 });

	bot.addContextCmd('allchars', 'allchars\t\tList all character names on server.', proto.cmdAllChars,
		Rpg, { maxArgs: 0 });

	// HELP
	bot.addContextCmd('lore', 'lore wot', proto.cmdLore, Rpg, { minArgs: 1, maxArgs: 1 });
	//bot.addContextCmd( 'rpgchanges', 'rpgchanges', proto.cmdChanges, RPG, {maxArgs:0});

	// PVP
	bot.addContextCmd('attack', 'attack [who] - attack something.', proto.cmdAttack, Rpg, { minArgs: 0, maxArgs: 1, alias: 'a' });
	bot.addContextCmd('track', 'track who', proto.cmdTrack, Rpg, { minArgs: 1, maxArgs: 1 });
	bot.addContextCmd('steal', 'steal fromwho', proto.cmdSteal, Rpg, { minArgs: 1, maxArgs: 2 });

	// PARTY
	bot.addContextCmd('party', 'party [who] - join party, invite to party, or show current party.',
		proto.cmdParty, Rpg, { minArgs: 0, maxArgs: 1 });
	bot.addContextCmd('revive', 'revive [who] - revive a party member.',
		proto.cmdRevive, Rpg, { minArgs: 0, maxArgs: 1 });
	bot.addContextCmd('leader', 'leader [who] - view or set party leader.',
		proto.cmdLeader, Rpg, { minArgs: 0, maxArgs: 1 });
	bot.addContextCmd('leaveparty', 'leaveparty - leave current party', proto.cmdLeaveParty, Rpg, { maxArgs: 0 });

	// GUILD
	bot.addContextCmd('mkguild', 'mkguild [name] - create a new guild', proto.cmdMkGuild, Rpg, { minArgs: 1, maxArgs: 1 });
	bot.addContextCmd('joinguild', 'joinguild [guild] - join a guild', proto.cmdJoinGuild, Rpg, { minArgs: 1, maxArgs: 1 });
	bot.addContextCmd('guildinv', 'guildinv [who] - invite to a guild', proto.cmdGuildInv, Rpg, { minArgs: 1, maxArgs: 1 });
	bot.addContextCmd('leaveguild', 'leaveguild - leave current guild', proto.cmdLeaveGuild, Rpg, { maxArgs: 0 });

	// EQUIP
	bot.addContextCmd('equip', 'equip [what]\t\tEquips item from inventory, or displays all worn items.',
		proto.cmdEquip, Rpg, { minArgs: 0, maxArgs: 1 });
	bot.addContextCmd('wear', 'wear [what]\t\tEquips item from inventory, or displays all worn items.',
		proto.cmdEquip, Rpg, { minArgs: 0, maxArgs: 1 });

	bot.addContextCmd('unequip', 'unequip [equip slot]\t\tRemoves a worn item.',
		proto.cmdUnequip, Rpg, { minArgs: 1, maxArgs: 1 });
	bot.addContextCmd('worn', 'worn [equip slot]\t\tInspect an equipped item.', proto.cmdWorn, Rpg, { maxArgs: 1 });
	bot.addContextCmd('compare', 'compare <pack item> - Compare inventory item to worn item.',
		proto.cmdCompare, Rpg, { minArgs: 1, maxArgs: 1 });

	// ITEMS
	bot.addContextCmd('destroy', 'destroy <item_number|item_name>\t\tDestroys an item. This action cannot be undone.',
		proto.cmdDestroy, Rpg, { minArgs: 1, maxArgs: 2 });
	bot.addContextCmd('inspect', 'inspect <item_number|item_name>', proto.cmdInspect, Rpg, { maxArgs: 1 });
	bot.addContextCmd('viewitem', 'viewitem <item_number|item_name> : View an item.', proto.cmdViewItem, Rpg, { maxArgs: 1 });
	bot.addContextCmd('inv', 'inv [player]', proto.cmdInv, Rpg, { maxArgs: 1 });
	bot.addContextCmd('give', 'give <charname> <what>', proto.cmdGive, Rpg, { minArgs: 2, maxArgs: 2, group: "right" });
	bot.addContextCmd('sell', 'sell <wot> OR !sell <start> <end>', proto.cmdSell, Rpg, { minArgs: 1, maxArgs: 2 });

	// CRAFT
	bot.addContextCmd('craft', 'craft <item_name> <description>', proto.cmdCraft, Rpg, { maxArgs: 2, group: "right" });
	bot.addContextCmd('brew', 'brew <potion> - brew a potion.', proto.cmdBrew, Rpg, { maxArgs: 1, group: "right" });
	bot.addContextCmd('inscribe', 'inscribe <item_number|item_name> <inscription>', proto.cmdInscribe, Rpg, { maxArgs: 2, group: "right" });
	bot.addContextCmd('potlist', 'potlist <level> - list of potions by level.', proto.cmdPotList, Rpg, { minArgs: 1, maxArgs: 1 });

	// DOWNTIME
	bot.addContextCmd('eat', 'eat <what>\t\tEat something from your inventory.', proto.cmdEat, Rpg, { minArgs: 1, maxArgs: 1 });
	bot.addContextCmd('cook', 'cook <what>\t\tCook an item in inventory.', proto.cmdCook, Rpg, { minArgs: 1, maxArgs: 1 });
	bot.addContextCmd('rest', 'rest', proto.cmdRest, Rpg, { maxArgs: 0 });
	bot.addContextCmd('quaff', 'quaff <what>\t\tQuaff a potion.', proto.cmdQuaff, Rpg, { minArgs: 1, maxArgs: 1 });

	bot.addContextCmd('rolldmg', 'rolldmg', proto.cmdRollDmg, Rpg, { hidden: true, maxArgs: 0 });
	bot.addContextCmd('rollweap', 'rollweap', proto.cmdRollWeap, Rpg, { hidden: true, maxArgs: 0 });
	bot.addContextCmd('rollarmor', 'rollarmor [slot]', proto.cmdRollArmor, Rpg, { hidden: true, maxArgs: 1 });


	// TESTING
	bot.addContextCmd('nerf', '', proto.cmdNerf, Rpg, { hidden: true, minArgs: 1, maxArgs: 1 });
	bot.addContextCmd('form', 'form <formula>', proto.cmdFormula, Rpg, { hidden: true, minArgs: 1, maxArgs: 1 });

	// NPC
	bot.addContextCmd('ex', 'ex [monster|npc]', proto.cmdExamine, Rpg, { maxArgs: 1 });

	// LOCATION
	bot.addContextCmd('look', 'look [item on ground]', proto.cmdLook, Rpg, { maxArgs: 1 });
	bot.addContextCmd('view', 'view <item_number|item_name>', proto.cmdViewLoc, Rpg);
	bot.addContextCmd('drop', 'drop <what> OR !drop <start> <end>', proto.cmdDrop, Rpg, { minArgs: 1, maxArgs: 2 });
	bot.addContextCmd('take', 'take <what> OR !take <start> <end>', proto.cmdTake, Rpg, { minArgs: 1, maxArgs: 2 });
	bot.addContextCmd('locdesc', 'locdesc <description>', proto.cmdLocDesc, Rpg, { minArgs: 1, maxArgs: 1 });
	bot.addContextCmd('explored', 'explored', proto.cmdExplored, Rpg, { maxArgs: 0 });
	bot.addContextCmd('sethome', 'sethome', proto.cmdSetHome, Rpg, { maxArgs: 0 });
	bot.addContextCmd('gohome', 'gohome', proto.cmdGoHome, Rpg, { maxArgs: 0 });
	//bot.addContextCmd( 'where', 'where [char]', proto.cmdWhere, RPG, {minArgs:1,maxArgs:1});
	bot.addContextCmd('scout', 'scout', proto.cmdScout, Rpg, { maxArgs: 0 });
	bot.addContextCmd('useloc', 'useloc [feature]', proto.cmdUseLoc, Rpg, { maxArgs: 1 });

	// MOVE
	bot.addContextCmd('move', 'move <direction>', proto.cmdMove, Rpg, { maxArgs: 1 });
	bot.addContextCmd('north', 'north', proto.cmdMove, Rpg, { maxArgs: 0, args: ['north'], alias: 'n' });
	bot.addContextCmd('south', 'south', proto.cmdMove, Rpg, { maxArgs: 0, args: ['south'], alias: 's' });
	bot.addContextCmd('east', 'east', proto.cmdMove, Rpg, { maxArgs: 0, args: ['east'], alias: 'e' });
	bot.addContextCmd('west', 'west', proto.cmdMove, Rpg, { maxArgs: 0, args: ['west'], alias: 'w' });
	bot.addContextCmd('hike', 'hike <direction>', proto.cmdHike, Rpg, { minArgs: 1, maxArgs: 1 });

}*/