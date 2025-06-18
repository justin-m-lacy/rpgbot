import { CreateCommand, type ChatAction, type CommandInfo } from '@/bot/command';
import type { DiscordBot } from '@/bot/discordbot';
import { GenChar } from 'rpg/builders/chargen';
import type { Char } from 'rpg/char/char';
import { InitItems } from '../rpg/builders/itemgen';
import { LoadActions } from '../rpg/magic/action';
import { LoadEffects } from '../rpg/magic/effects';
import { InitClasses, InitRaces, RandClass, RandRace } from '../rpg/parsers/classes';
import { Rpg } from '../rpg/rpg';


/**
	 * Command to list all chars in instance..
	 * @param m 
	 * @param uname 
	 * @returns 
	 */
async function cmdAllChars(rpg: Rpg, m: ChatAction, uname?: string) {

	try {
		const list = await rpg.context.getDataList(RPG_DIR + '/chars');
		if (!list) return m.reply('Could not get char list.');

		return m.reply(list.join(', '));

	} catch (e) { console.log(e); }

}

/**
 * Get status of current party, or invite char to user party,
 * or join char's party.
 * @param m 
 * @param who 
 * @returns 
 */
async function cmdParty(rpg: Rpg, m: ChatAction, who?: string) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	let t: Char | undefined;
	if (who) {
		t = await rpg.loadChar(who);
		if (!t) return;
	}

	return Display.SendBlock(m, await rpg.game.party(char, t));

}

/**
 * Set party leader.
 * @param m 
 * @param who 
 * @returns 
 */
async function cmdLeader(rpg: Rpg, m: ChatAction, who?: string) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	let t: Char | undefined;
	if (who) {
		t = await rpg.loadChar(who);
		if (!t) return;
	}

	return Display.SendBlock(m, rpg.game.setLeader(char, t));

}

async function cmdRevive(rpg: Rpg, m: ChatAction, who?: string) {

	if (!who) return;

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	const t = who ? await rpg.loadChar(who) : char;
	if (!t) return;

	await Display.SendBlock(m, rpg.game.revive(char, t));

}

async function cmdLeaveParty(rpg: Rpg, m: ChatAction) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	await Display.SendBlock(m, rpg.game.leaveParty(char));
}

async function cmdMkGuild(rpg: Rpg, m: ChatAction, gname: string) {

	try {
		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await Display.SendBlock(m, await rpg.game.mkGuild(char, gname));
	} catch (e) { console.log(e); }

}

async function cmdJoinGuild(rpg: Rpg, m: ChatAction, gname: string) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	await Display.SendBlock(m, await rpg.game.joinGuild(char, gname));

}

async function cmdLeaveGuild(rpg: Rpg, m: ChatAction) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	await Display.SendBlock(m, await rpg.game.leaveGuild(char));

}

async function cmdGuildInv(rpg: Rpg, m: ChatAction, who?: string) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	const t = who ? await rpg.loadChar(who) : char;
	if (!t) return;

	return Display.SendBlock(m, await rpg.game.guildInv(char, t));

}

async function cmdWhere(rpg: Rpg, m: ChatAction, who: string) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	const t = await rpg.loadChar(who);
	if (!t) return;
	return m.reply(t.name + ' is at ' + t.loc.toString());

}

async function cmdNerf(rpg: Rpg, m: ChatAction, who: string) {

	const char = await rpg.loadChar(who);
	if (!char) return;

	if (!rpg.context.isOwner(m.user)) return m.reply('You do not have permission to do that.');

	return m.reply(Trade.nerfItems(char));

}

async function cmdFormula(rpg: Rpg, m: ChatAction, str: string) {

	if (!rpg.context.isOwner(m.user)) return m.reply('You do not have permission to do that.');
	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	try {
		const f = Formula.TryParse(str);
		if (!f) return m.reply('Incantation malformed.');

		const res = f.eval(char);
		return m.reply('result: ' + res);

	} catch (e) { console.log(e); }

}

async function cmdSetHome(rpg: Rpg, m: ChatAction) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	return m.reply(rpg.world.setHome(char));

}

async function cmdGoHome(rpg: Rpg, m: ChatAction) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	return m.reply(rpg.game.goHome(char));

}

async function cmdLocDesc(rpg: Rpg, m: ChatAction, desc: string) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	const resp = await rpg.world.setDesc(char, desc, m.attachments?.first()?.proxyURL);
	if (resp) return m.reply(resp);

}

async function cmdLore(rpg: Rpg, m: ChatAction, wot?: string) {

	if (!wot) return m.reply('What do you want to know about?');

	return Display.SendBlock(m, GetLore(wot));

}

async function cmdTake(rpg: Rpg, m: ChatAction, first: string, end: string) {

	try {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		await m.reply(await rpg.game.take(char, first, end));

	} catch (e) { console.log(e); }
}

async function cmdDrop(rpg: Rpg, m: ChatAction, what: string, end?: string) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	return m.reply(await rpg.game.drop(char, what, end));

}

async function cmdExplored(rpg: Rpg, m: ChatAction) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	return Display.SendBlock(m, await rpg.world.explored(char));

}

async function cmdViewLoc(rpg: Rpg, m: ChatAction, what: string | number) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	const info = await rpg.world.view(char, what);

	if (typeof (info) === 'string') await Display.SendBlock(m, info);
	else Display.SendEmbed(m, info[0], info[1]);

}

async function cmdExamine(rpg: Rpg, m: ChatAction, what: string) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	await Display.SendBlock(m, await rpg.world.examine(char, what));

}

async function cmdLook(rpg: Rpg, m: ChatAction, what: string) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	return Display.SendBlock(m, await rpg.world.look(char, what));

}

async function cmdUseLoc(rpg: Rpg, m: ChatAction, wot: string) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	return Display.SendBlock(m, await rpg.world.useLoc(char, wot));
}

async function cmdHike(rpg: Rpg, m: ChatAction, dir: string) {

	try {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await Display.SendBlock(m, await rpg.game.hike(char, toDirection(dir)));
		rpg.checkLevel(m, char);

	} catch (e) { console.log(e); }

}

async function cmdMove(rpg: Rpg, m: ChatAction, dir: string) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	await Display.SendBlock(m, await rpg.game.move(char, dir));
	rpg.checkLevel(m, char);

}

/**
 * Roll damage test with current weapon.
 * @param {*} m
 */
async function cmdRollDmg(rpg: Rpg, m: ChatAction) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (char) {
		return m.reply('Weapon roll for ' + char.name + ': ' + char.testDmg());
	}

}

/**
 * Roll a new armor for testing.
 * @param {*} m
 */
async function cmdRollWeap(rpg: Rpg, m: ChatAction) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (char) {
		await Display.SendBlock(m, Trade.rollWeap(char));
	}

}

/**
 * Roll a new armor for testing.
 * @param {Message} m
 */
async function cmdRollArmor(rpg: Rpg, m: ChatAction, slot?: string) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (char) {
		await Display.SendBlock(m, Trade.rollArmor(char, slot));
	}

}

async function cmdUnequip(rpg: Rpg, m: ChatAction, slot: HumanSlot) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	return m.reply(rpg.game.unequip(char, slot));

}

async function cmdEquip(rpg: Rpg, m: ChatAction, wot: string | number) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	if (!wot) return Display.SendBlock(m, `${char.name} equip:\n${char.listEquip()}`);

	return Display.SendBlock(m, rpg.game.equip(char, wot));

}

async function cmdCompare(rpg: Rpg, m: ChatAction, wot: string | number) {

	const char = await rpg.userCharOrErr(m, m.user)

	if (char) {
		if (!wot) return m.reply('Compare what item?');
		return Display.SendBlock(m, rpg.game.compare(char, wot));
	}

}

async function cmdWorn(rpg: Rpg, m: ChatAction, slot: HumanSlot) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;
	if (!slot) await Display.SendBlock(m, `${char.name} equip:\n${char.listEquip()}`);
	else {

		const item = char.getEquip(slot);
		if (!item) return m.reply('Nothing equipped in ' + slot + ' slot.');
		if (typeof (item) === 'string') return m.reply(item);
		else if (Array.isArray(item)) {

			let r = '';
			for (let i = item.length - 1; i >= 0; i--) {
				r += item[i].getDetails() + '\n';
			}
			return m.reply(r);

		} else return m.reply(item.getDetails());

	} //

}

async function cmdEat(rpg: Rpg, m: ChatAction, wot: string | number) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (char) {
		return m.reply(rpg.game.eat(char, wot));
	}

}

async function cmdQuaff(rpg: Rpg, m: ChatAction, wot: string | number) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (char) {
		return m.reply(rpg.game.quaff(char, wot));
	}

}

async function cmdRest(rpg: Rpg, m: ChatAction) {
	const char = await rpg.userCharOrErr(m, m.user);
	if (char) return m.reply(await rpg.game.rest(char));
}

async function cmdCook(rpg: Rpg, m: ChatAction, what: string | number) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (char) {
		return m.reply(rpg.game.cook(char, what));
	}

}

function cmdPotList(rpg: Rpg, m: ChatAction, level?: string | number) {

	if (!level) return m.reply('List potions for which level?');
	if (typeof level === 'string') level = parseInt(level);
	return m.reply(PotsList(level));

}

async function cmdInscribe(rpg: Rpg, m: ChatAction, wot?: string | number, inscrip?: string) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	if (!wot) return m.reply('Inscribe which inventory item?');
	/// allow clearing existing inscription
	if (!inscrip) inscrip = '';

	return m.reply(rpg.game.inscribe(char, wot, inscrip));

}

async function cmdDestroy(rpg: Rpg, m: ChatAction, first?: string, end?: string) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	if (!first) return m.reply('Destroy which inventory item?');

	return m.reply(rpg.game.destroy(char, first, end));

}

async function cmdViewItem(rpg: Rpg, m: ChatAction, which?: string | number) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	if (!which) return m.reply('View which inventory item?');

	const item = char.getItem(which);
	if (!item) return m.reply('Item not found.');

	const view = Array.isArray(item) ? item[0].getView() : item.getView();
	if (view[1]) {

		return replyEmbedUrl(m, view[1], view[0]);
	}
	else await m.reply(view[0]);

}

async function cmdInspect(rpg: Rpg, m: ChatAction, wot?: string | number) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	if (!wot) return m.reply('Inspect which inventory item?');

	let item = char.getItem(wot);
	if (Array.isArray(item)) item = item[0];
	if (!item) return m.reply('Item not found.');
	return m.reply(item.getDetails());

}

async function cmdCraft(rpg: Rpg, m: ChatAction, itemName?: string, desc?: string) {

	if (!itemName) return m.reply('Crafted items must have names.');
	if (!desc) return m.reply('Crafted items require a description.');

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	const a = m.attachments.first();
	const res = a ? rpg.game.craft(char, itemName, desc, a.proxyURL) : rpg.game.craft(char, itemName, desc);

	return Display.SendBlock(m, res);

}

async function cmdBrew(rpg: Rpg, m: ChatAction, potName?: string) {

	if (!potName) return m.reply('Brew what potion?');

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	const a = m.attachments.first();
	const res = a ? rpg.game.brew(char, potName, a.proxyURL) : rpg.game.brew(char, potName);

	return Display.SendBlock(m, res);

}

async function cmdInv(rpg: Rpg, m: ChatAction, who?: string) {

	let char;

	if (who) {

		char = await rpg.loadChar(who);
		if (!char) return m.reply(`'${who}' not found.`);


	} else {

		char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

	}

	return Display.SendBlock(m, `${char.name} Inventory:\n${char.inv.getMenu()}`);

}

async function cmdSell(rpg: Rpg, m: ChatAction, first: string | number, end?: string | number) {

	const src = await rpg.userCharOrErr(m, m.user);
	if (!src) return;

	return Display.SendBlock(m, rpg.game.sell(src, first, end));
}

async function cmdGive(rpg: Rpg, m: ChatAction, who: string, expr: string) {

	const src = await rpg.userCharOrErr(m, m.user);
	if (!src) return;

	const dest = await rpg.loadChar(who);
	if (!dest) return m.reply(`'${who}' does not exist.`);

	return m.reply(rpg.game.give(src, dest, expr));

}

async function cmdScout(rpg: Rpg, m: ChatAction) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	await Display.SendBlock(m, rpg.game.scout(char));

}

async function cmdTrack(rpg: Rpg, m: ChatAction, who: string) {

	const src = await rpg.userCharOrErr(m, m.user);
	if (!src) return;

	const dest = await rpg.loadChar(who);
	if (!dest) return m.reply(`'${who}' does not exist.`);

	await Display.SendBlock(m, rpg.game.track(src, dest));

}

async function cmdAttack(rpg: Rpg, m: ChatAction, who?: string | number) {

	try {
		const src = await rpg.userCharOrErr(m, m.user);
		if (!src) return;

		let targ = await rpg.world.getNpc(src, who ?? 1);
		let res;

		if (targ) {
			res = await (targ instanceof Monster ?
				rpg.game.attackNpc(src, targ)
				: rpg.game.attack(src, targ)
			);
		} else if (typeof who === 'string') {

			targ = await rpg.loadChar(who);
			if (!targ) return m.reply(`'${who}' not found.`);

			res = await rpg.game.attack(src, targ);

		} else {
			return m.reply(`'${who}' not found.`);
		}


		await Display.SendBlock(m, res);

	} catch (e) { console.log(e); }

}

async function cmdSteal(rpg: Rpg, m: ChatAction, who: string, wot?: string) {

	const src = await rpg.userCharOrErr(m, m.user);
	if (!src) return;

	const dest = await rpg.loadChar(who);
	if (!dest) return m.reply(`'${who}' not found on server.`);

	const result = await rpg.game.steal(src, dest, wot);
	await Display.SendBlock(m, result);

}

async function cmdRmChar(rpg: Rpg, m: ChatAction, charname?: string) {

	if (!charname) return m.reply('Must specify character to delete.');

	try {

		const char = await rpg.loadChar(charname);
		if (!char) return m.reply(`'${charname}' not found on server.`);

		if (!char.owner || char.owner === m.user.id) {

			await rpg.charCache.delete(rpg.getCharKey(charname));

			// TODO: REMOVE LAST LOADED NAME. etc.
			if (rpg.lastChars[char.owner] === charname) rpg.clearUserChar(char.owner);

			return m.reply(charname + ' deleted.');

		} else return m.reply('You do not have permission to delete ' + charname);

	} catch (e) { console.log(e); }

}

async function cmdViewChar(rpg: Rpg, m: ChatAction, charname?: string) {

	let char;

	if (!charname) {
		char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;
	} else {
		char = await rpg.loadChar(charname);
		if (!char) return m.reply(charname + ' not found on server. D:');
	}
	return Display.EchoChar(m.channel, char);

}

async function cmdAddStat(rpg: Rpg, m: ChatAction, stat: string) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	const res = char.addStat(stat);
	if (typeof (res) === 'string') return m.reply(res);

}

async function cmdTalents(rpg: Rpg, m: ChatAction, charname?: string) {

	let char;

	if (!charname) {
		char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;
	} else {
		char = await rpg.loadChar(charname);
		if (!char) return m.reply(charname + ' not found on server. D:');
	}

	await Display.SendBlock(m, char.getTalents());

}

async function cmdCharStats(rpg: Rpg, m: ChatAction, charname?: string) {

	let char;

	if (!charname) {
		char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;
	} else {
		char = await rpg.loadChar(charname);
		if (!char) return m.reply(charname + ' not found on server. :O');
	}

	await Display.SendBlock(m, getHistory(char));

}

async function cmdSaveChar(rpg: Rpg, m: ChatAction) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	await rpg.saveChar(char, true);
	return m.reply(char.name + ' saved.');

}

async function cmdLoadChar(rpg: Rpg, m: ChatAction, charname?: string) {

	if (!charname) charname = m.user.username;

	try {

		const char = await rpg.loadChar(charname);
		if (!char) return m.reply(charname + ' not found on server. D:');

		let prefix;

		if (char.owner !== m.user.id) {
			prefix = 'This is NOT your character.\n';
		} else {

			await rpg.setUserChar(m.user, char);
			prefix = 'Active character set.\n';
		}

		return Display.EchoChar(m.channel, char, prefix);

	} catch (e) { console.log(e); }

}

async function cmdRollChar(rpg: Rpg, m: ChatAction, charname?: string, racename?: string, classname?: string, sex?: string) {

	try {

		const race = RandRace(racename);
		if (!race) return await m.reply('Race ' + racename + ' not found.');

		const charCls = RandClass(classname);
		if (!charCls) return await m.reply('Class ' + classname + ' not found.');

		if (!sex) sex = Math.random() < 0.5 ? 'm' : 'f';

		if (charname) {

			if (!rpg.context.isValidKey(charname)) return m.reply(`'${charname}' contains illegal letters.`);
			if (await rpg.charExists(charname)) return m.reply(`Character '${charname}' already exists.`);

		} else charname = await rpg.uniqueName(race, sex);

		const char = GenChar(m.user.id, race, charCls, charname);

		await rpg.setUserChar(m.user, char);
		Display.EchoChar(m.channel, char);
		await rpg.saveChar(char, true);

	} catch (e) { console.log(e); }

}

export function GetCommands() {

	const list: CommandInfo[] = [];

	CreateCommand('rollchar', 'rollchar [charname] [racename] [classname]', cmdRollChar, list);

	CreateCommand('loadchar', 'loadchar <charname>', cmdLoadChar, list, { maxArgs: 1 });
	CreateCommand('savechar', 'savechar', cmdSaveChar, list, { maxArgs: 0 });

	CreateCommand('viewchar', 'viewchar <charname>', cmdViewChar, list, { maxArgs: 1 });
	CreateCommand('rmchar', 'rmchar <charname>', cmdRmChar, list, { minArgs: 1, maxArgs: 1 });
	CreateCommand('charstats', 'charstats [charname]', cmdCharStats, list, { minArgs: 0, maxArgs: 1 });
	CreateCommand('talents', 'talents [charname]', cmdTalents, list, { minArgs: 0, maxArgs: 1 });

	CreateCommand('addstat', 'addstat [statname]', cmdAddStat, list, { minArgs: 1, maxArgs: 1 });

	CreateCommand('allchars', 'allchars\t\tList all character names on server.', cmdAllChars,
		list, { maxArgs: 0 });

	// HELP
	CreateCommand('lore', 'lore wot', cmdLore, list, { minArgs: 1, maxArgs: 1 });
	//CreateCommand( 'rpgchanges', 'rpgchanges', cmdChanges, RPG, {maxArgs:0});

	// PVP
	CreateCommand('attack', 'attack [who] - attack something.', cmdAttack, list, { minArgs: 0, maxArgs: 1, alias: 'a' });
	CreateCommand('track', 'track who', cmdTrack, list, { minArgs: 1, maxArgs: 1 });
	CreateCommand('steal', 'steal fromwho', cmdSteal, list, { minArgs: 1, maxArgs: 2 });

	// PARTY
	CreateCommand('party', 'party [who] - join party, invite to party, or show current party.',
		cmdParty, list, { minArgs: 0, maxArgs: 1 });
	CreateCommand('revive', 'revive [who] - revive a party member.',
		cmdRevive, list, { minArgs: 0, maxArgs: 1 });
	CreateCommand('leader', 'leader [who] - view or set party leader.',
		cmdLeader, list, { minArgs: 0, maxArgs: 1 });
	CreateCommand('leaveparty', 'leaveparty - leave current party', cmdLeaveParty, list, { maxArgs: 0 });

	// GUILD
	CreateCommand('mkguild', 'mkguild [name] - create a new guild', cmdMkGuild, list, { minArgs: 1, maxArgs: 1 });
	CreateCommand('joinguild', 'joinguild [guild] - join a guild', cmdJoinGuild, list, { minArgs: 1, maxArgs: 1 });
	CreateCommand('guildinv', 'guildinv [who] - invite to a guild', cmdGuildInv, list, { minArgs: 1, maxArgs: 1 });
	CreateCommand('leaveguild', 'leaveguild - leave current guild', cmdLeaveGuild, list, { maxArgs: 0 });

	// EQUIP
	CreateCommand('equip', 'equip [what]\t\tEquips item from inventory, or displays all worn items.',
		cmdEquip, list, { minArgs: 0, maxArgs: 1 });
	CreateCommand('wear', 'wear [what]\t\tEquips item from inventory, or displays all worn items.',
		cmdEquip, list, { minArgs: 0, maxArgs: 1 });

	CreateCommand('unequip', 'unequip [equip slot]\t\tRemoves a worn item.',
		cmdUnequip, list, { minArgs: 1, maxArgs: 1 });
	CreateCommand('worn', 'worn [equip slot]\t\tInspect an equipped item.', cmdWorn, list, { maxArgs: 1 });
	CreateCommand('compare', 'compare <pack item> - Compare inventory item to worn item.',
		cmdCompare, list, { minArgs: 1, maxArgs: 1 });

	// ITEMS
	CreateCommand('destroy', 'destroy <item_number|item_name>\t\tDestroys an item. This action cannot be undone.',
		cmdDestroy, list, { minArgs: 1, maxArgs: 2 });
	CreateCommand('inspect', 'inspect <item_number|item_name>', cmdInspect, list, { maxArgs: 1 });
	CreateCommand('viewitem', 'viewitem <item_number|item_name> : View an item.', cmdViewItem, list, { maxArgs: 1 });
	CreateCommand('inv', 'inv [player]', cmdInv, list, { maxArgs: 1 });
	CreateCommand('give', 'give <charname> <what>', cmdGive, list, { minArgs: 2, maxArgs: 2, group: "right" });
	CreateCommand('sell', 'sell <wot> OR !sell <start> <end>', cmdSell, list, { minArgs: 1, maxArgs: 2 });

	// CRAFT
	CreateCommand('craft', 'craft <item_name> <description>', cmdCraft, list, { maxArgs: 2, group: "right" });
	CreateCommand('brew', 'brew <potion> - brew a potion.', cmdBrew, list, { maxArgs: 1, group: "right" });
	CreateCommand('inscribe', 'inscribe <item_number|item_name> <inscription>', cmdInscribe, list, { maxArgs: 2, group: "right" });
	CreateCommand('potlist', 'potlist <level> - list of potions by level.', cmdPotList, list, { minArgs: 1, maxArgs: 1 });

	// DOWNTIME
	CreateCommand('eat', 'eat <what>\t\tEat something from your inventory.', cmdEat, list, { minArgs: 1, maxArgs: 1 });
	CreateCommand('cook', 'cook <what>\t\tCook an item in inventory.', cmdCook, list, { minArgs: 1, maxArgs: 1 });
	CreateCommand('rest', 'rest', cmdRest, list, { maxArgs: 0 });
	CreateCommand('quaff', 'quaff <what>\t\tQuaff a potion.', cmdQuaff, list, { minArgs: 1, maxArgs: 1 });

	CreateCommand('rolldmg', 'rolldmg', cmdRollDmg, list, { hidden: true, maxArgs: 0 });
	CreateCommand('rollweap', 'rollweap', cmdRollWeap, list, { hidden: true, maxArgs: 0 });
	CreateCommand('rollarmor', 'rollarmor [slot]', cmdRollArmor, list, { hidden: true, maxArgs: 1 });


	// TESTING
	CreateCommand('nerf', '', cmdNerf, list, { hidden: true, minArgs: 1, maxArgs: 1 });
	CreateCommand('form', 'form <formula>', cmdFormula, list, { hidden: true, minArgs: 1, maxArgs: 1 });

	// NPC
	CreateCommand('ex', 'ex [monster|npc]', cmdExamine, list, { maxArgs: 1 });

	// LOCATION
	CreateCommand('look', 'look [item on ground]', cmdLook, list, { maxArgs: 1 });
	CreateCommand('view', 'view <item_number|item_name>', cmdViewLoc, list);
	CreateCommand('drop', 'drop <what> OR !drop <start> <end>', cmdDrop, list, { minArgs: 1, maxArgs: 2 });
	CreateCommand('take', 'take <what> OR !take <start> <end>', cmdTake, list, { minArgs: 1, maxArgs: 2 });
	CreateCommand('locdesc', 'locdesc <description>', cmdLocDesc, list, { minArgs: 1, maxArgs: 1 });
	CreateCommand('explored', 'explored', cmdExplored, list, { maxArgs: 0 });
	CreateCommand('sethome', 'sethome', cmdSetHome, list, { maxArgs: 0 });
	CreateCommand('gohome', 'gohome', cmdGoHome, list, { maxArgs: 0 });
	//CreateCommand( 'where', 'where [char]', cmdWhere, RPG, {minArgs:1,maxArgs:1});
	CreateCommand('scout', 'scout', cmdScout, list, { maxArgs: 0 });
	CreateCommand('useloc', 'useloc [feature]', cmdUseLoc, list, { maxArgs: 1 });

	// MOVE
	CreateCommand('move', 'move <direction>', cmdMove, list, { maxArgs: 1 });
	CreateCommand('north', 'north', cmdMove, list, { maxArgs: 0, args: ['north'], alias: 'n' });
	CreateCommand('south', 'south', cmdMove, list, { maxArgs: 0, args: ['south'], alias: 's' });
	CreateCommand('east', 'east', cmdMove, list, { maxArgs: 0, args: ['east'], alias: 'e' });
	CreateCommand('west', 'west', cmdMove, list, { maxArgs: 0, args: ['west'], alias: 'w' });
	CreateCommand('hike', 'hike <direction>', cmdHike, list, { minArgs: 1, maxArgs: 1 });

	return list;

}


export const InitGame = async (bot: DiscordBot) => {

	await Promise.all([InitRaces(), InitClasses(), InitItems(), LoadEffects(), LoadActions()])

	const proto = Rpg.prototype;

}