import { CreateCommand, type ChatAction, type CommandInfo } from '@/bot/command';
import type { DiscordBot } from '@/bot/discordbot';
import { ReplyEmbed } from '@/embeds';
import { EchoChar, SendBlock } from 'rpg/display/display';
import { getHistory } from 'rpg/events';
import type { HumanSlot } from 'rpg/items/wearable';
import { Monster } from 'rpg/monster/monster';
import { rollArmor, rollWeap } from 'rpg/trade';
import { InitItems, PotsList } from '../rpg/builders/itemgen';
import { LoadActions } from '../rpg/magic/action';
import { LoadEffects } from '../rpg/magic/effects';
import { InitClasses, InitRaces } from '../rpg/parsers/classes';
import { Rpg } from '../rpg/rpg';

/**
 * Roll damage test with current weapon.
 * @param {*} m
 */
async function cmdRollDmg(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (char) {
		return m.reply('Weapon roll for ' + char.name + ': ' + char.testDmg());
	}

}

/**
 * Roll a new armor for testing.
 * @param {*} m
 */
async function cmdRollWeap(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (char) {
		await SendBlock(m, rollWeap(char));
	}

}

/**
 * Roll a new armor for testing.
 * @param {Message} m
 */
async function cmdRollArmor(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user);
	const slot = m.options.getString('slot');
	if (char) {
		await SendBlock(m, rollArmor(char, slot));
	}

}

async function cmdUnequip(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	const slot = m.options.getString('slot', true);

	return m.reply(rpg.game.unequip(char, slot));

}

async function cmdEquip(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	const what = m.options.getString('what', true);

	if (!what) return SendBlock(m, `${char.name} equip:\n${char.listEquip()}`);

	return SendBlock(m, rpg.game.equip(char, what));

}

async function cmdCompare(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)

	if (char) {
		const what = m.options.getString('what', true);

		if (!what) return m.reply('Compare what item?');
		return SendBlock(m, rpg.game.compare(char, what));
	}

}

async function cmdWorn(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	const slot = m.options.getString('slot', true) as HumanSlot;
	if (!slot) await SendBlock(m, `${char.name} equip:\n${char.listEquip()}`);
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

async function cmdEat(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (char) {
		const what = m.options.getString('what', true);
		return m.reply(rpg.game.eat(char, what));
	}

}

async function cmdQuaff(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (char) {
		const what = m.options.getString('what', true);
		return m.reply(rpg.game.quaff(char, what));
	}

}

async function cmdRest(m: ChatAction, rpg: Rpg) {
	const char = await rpg.userCharOrErr(m, m.user);
	if (char) return m.reply(await rpg.game.rest(char));
}

async function cmdCook(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (char) {
		const what = m.options.getString('what', true);
		return m.reply(rpg.game.cook(char, what));
	}

}

function cmdPotList(m: ChatAction, rpg: Rpg) {

	let level: string | number = m.options.getString('level', true);

	if (!level) return m.reply('List potions for which level?');
	if (typeof level === 'string') level = parseInt(level);
	return m.reply(PotsList(level));

}

async function cmdInscribe(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	const what = m.options.getString('what', true);
	const script = m.options.getString('inscription') ?? '';

	if (!what) return m.reply('Inscribe which inventory item?');

	return m.reply(rpg.game.inscribe(char, what, script));

}

async function cmdDestroy(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	const start = m.options.getString('start');
	const end = m.options.getString('end');

	if (!start) return m.reply('Destroy which inventory item?');

	return m.reply(rpg.game.destroy(char, start, end));

}

async function cmdViewItem(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	const which = m.options.getString('which');

	if (!which) return m.reply('View which inventory item?');

	const item = char.getItem(which);
	if (!item) return m.reply('Item not found.');

	const view = Array.isArray(item) ? item[0].getView() : item.getView();
	if (view[1]) {

		return ReplyEmbed(m, view[1], view[0]);
	}
	else await m.reply(view[0]);

}

async function cmdInspect(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	const what = m.options.getString('what');
	if (!what) return m.reply('Inspect which inventory item?');

	let item = char.getItem(what);
	if (Array.isArray(item)) item = item[0];
	if (!item) return m.reply('Item not found.');
	return m.reply(item.getDetails());

}

async function cmdCraft(m: ChatAction, rpg: Rpg) {

	const what = m.options.getString('what', true);
	const desc = m.options.getString('desc', true);

	if (!what) return m.reply('Crafted item must have a name.');
	if (!desc) return m.reply('Crafted items require a description.');

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	//const a = m.attachments.first();
	const res = rpg.game.craft(char, what, desc);

	return SendBlock(m, res);

}

async function cmdBrew(m: ChatAction, rpg: Rpg) {

	const potion = m.options.getString('potion', true);

	if (!potion) return m.reply('Brew what potion?');

	const char = await rpg.userCharOrErr(m, m.user)
	if (!char) return;

	//const a = m.attachments.first();
	const res = rpg.game.brew(char, potion);

	return SendBlock(m, res);

}

async function cmdInv(m: ChatAction, rpg: Rpg) {

	let char;

	const who = m.options.getString('who');

	if (who) {

		char = await rpg.loadChar(who);
		if (!char) return m.reply(`'${who}' not found.`);


	} else {

		char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

	}

	return SendBlock(m, `${char.name} Inventory:\n${char.inv.getMenu()}`);

}

async function cmdSell(m: ChatAction, rpg: Rpg) {

	const start = m.options.getString('start', true);
	const end = m.options.getString('end');

	const src = await rpg.userCharOrErr(m, m.user);
	if (!src) return;

	return SendBlock(m, rpg.game.sell(src, start, end));
}

async function cmdGive(m: ChatAction, rpg: Rpg) {

	const src = await rpg.userCharOrErr(m, m.user);
	if (!src) return;

	const who = m.options.getString('who', true);
	const what = m.options.getString('what', true);

	const dest = await rpg.loadChar(who);
	if (!dest) return m.reply(`'${who}' does not exist.`);

	return m.reply(rpg.game.give(src, dest, what));

}

async function cmdScout(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	await SendBlock(m, rpg.game.scout(char));

}

async function cmdTrack(m: ChatAction, rpg: Rpg) {

	const src = await rpg.userCharOrErr(m, m.user);
	if (!src) return;

	const who = m.options.getString('who', true);

	const dest = await rpg.loadChar(who);
	if (!dest) return m.reply(`'${who}' does not exist.`);

	await SendBlock(m, rpg.game.track(src, dest));

}

async function cmdAttack(m: ChatAction, rpg: Rpg) {

	const who = m.options.getString('who');

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

	await SendBlock(m, res);

}

async function cmdSteal(m: ChatAction, rpg: Rpg) {

	const src = await rpg.userCharOrErr(m, m.user);
	if (!src) return;

	const who = m.options.getString('who', true);
	const what = m.options.getString('what');

	const dest = await rpg.loadChar(who);
	if (!dest) return m.reply(`'${who}' not found on server.`);

	const result = await rpg.game.steal(src, dest, what);
	await SendBlock(m, result);

}

async function cmdRmChar(m: ChatAction, rpg: Rpg) {

	const charname = m.options.getString('who', true);

	if (!charname) return m.reply('Must specify character to delete.');

	const char = await rpg.loadChar(charname);
	if (!char) return m.reply(`'${charname}' not found on server.`);

	if (!char.owner || char.owner === m.user.id) {

		await rpg.charCache.delete(rpg.getCharKey(charname));

		// TODO: REMOVE LAST LOADED NAME. etc.
		if (rpg.getLastChar(char.owner) === charname) rpg.clearUserChar(char.owner);

		return m.reply(charname + ' deleted.');

	} else return m.reply('You do not have permission to delete ' + charname);



}

async function cmdViewChar(m: ChatAction, rpg: Rpg) {

	let char;

	const charname = m.options.getString('who');

	if (!charname) {
		char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;
	} else {
		char = await rpg.loadChar(charname);
		if (!char) return m.reply(charname + ' not found on server. D:');
	}
	return EchoChar(m, char);

}

async function cmdAddStat(m: ChatAction, rpg: Rpg) {

	const stat = m.options.getString('stat', true);

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	const res = char.addStat(stat);
	if (typeof (res) === 'string') return m.reply(res);

}

async function cmdTalents(m: ChatAction, rpg: Rpg) {

	let char;

	const who = m.options.getString('who');

	if (!who) {
		char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;
	} else {
		char = await rpg.loadChar(who);
		if (!char) return m.reply(who + ' not found on server. D:');
	}

	await SendBlock(m, char.getTalents());

}

async function cmdCharStats(m: ChatAction, rpg: Rpg) {

	let char;

	const who = m.options.getString('who');

	if (!who) {
		char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;
	} else {
		char = await rpg.loadChar(who);
		if (!char) return m.reply(who + ' not found on server. :O');
	}

	await SendBlock(m, getHistory(char));

}

async function cmdSaveChar(m: ChatAction, rpg: Rpg) {

	const char = await rpg.userCharOrErr(m, m.user);
	if (!char) return;

	await rpg.saveChar(char, true);
	return m.reply(char.name + ' saved.');

}

async function cmdLoadChar(m: ChatAction, rpg: Rpg) {

	const charname = m.options.getString('char') ?? m.user.username;

	const char = await rpg.loadChar(charname);
	if (!char) return m.reply(charname + ' not found on server. D:');

	let prefix;

	if (char.owner !== m.user.id) {
		prefix = 'This is NOT your character.\n';
	} else {

		await rpg.setUserChar(m.user, char);
		prefix = 'Active character set.\n';
	}

	return EchoChar(m, char, prefix);

}

export function GetCommands() {

	const list: CommandInfo[] = [];

	CreateCommand('loadchar', 'loadchar <charname>', cmdLoadChar, list, { maxArgs: 1 });
	CreateCommand('savechar', 'savechar', cmdSaveChar, list, { maxArgs: 0 });

	CreateCommand('viewchar', 'viewchar <charname>', cmdViewChar, list, { maxArgs: 1 });
	CreateCommand('rmchar', 'rmchar <charname>', cmdRmChar, list, { minArgs: 1, maxArgs: 1 });
	CreateCommand('charstats', 'charstats [charname]', cmdCharStats, list, { minArgs: 0, maxArgs: 1 });
	CreateCommand('talents', 'talents [charname]', cmdTalents, list, { minArgs: 0, maxArgs: 1 });

	CreateCommand('addstat', 'addstat [statname]', cmdAddStat, list, { minArgs: 1, maxArgs: 1 });


	// PVP
	CreateCommand('attack', 'attack [who] - attack something.', cmdAttack, list, { minArgs: 0, maxArgs: 1, alias: 'a' });
	CreateCommand('track', 'track who', cmdTrack, list, { minArgs: 1, maxArgs: 1 });
	CreateCommand('steal', 'steal fromwho', cmdSteal, list, { minArgs: 1, maxArgs: 2 });

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