import { CreateCommand, type CommandInfo } from '@/bot/command';
import type { DiscordBot } from '@/bot/discordbot';
import { InitItems } from '../rpg/builders/itemgen';
import { LoadActions } from '../rpg/magic/action';
import { LoadEffects } from '../rpg/magic/effects';
import { InitClasses, InitRaces } from '../rpg/parsers/classes';
import { Rpg } from '../rpg/rpg';


function cmdRollChar() {
}

function cmdLoadChar() {
}

function cmdSaveChar() {
}

function cmdViewChar() {
}

function cmdRmChar() {
}

function cmdCharStats() {
}

function cmdTalents() {
}

function cmdAddStat() {
}

function cmdAllChars() {
}

function cmdLore() {
}

function cmdAttack() {
}

function cmdTrack() {
}

function cmdSteal() {
}

function cmdParty() {
}

function cmdRevive() {
}

function cmdLeader() {
}

function cmdLeaveParty() {
}

function cmdMkGuild() {
}

function cmdJoinGuild() {
}

function cmdLeaveGuild() {
}

function cmdGuildInv() {
}

function cmdEquip() {
}

function cmdWorn() { }

function cmdUnequip() {
}

function cmdCompare() {
}


function cmdDestroy() {
}

function cmdInspect() {
}

function cmdViewItem() {
}

function cmdInv() {
}

function cmdGive() {
}

function cmdSell() {
}

function cmdCraft() {
}

function cmdBrew() {
}

function cmdInscribe() {
}

function cmdPotList() {
}

function cmdEat() {
}

function cmdCook() {
}

function cmdRest() {
}

function cmdQuaff() {
}

function cmdRollDmg() {
}

function cmdRollWeap() {
}

function cmdRollArmor() {
}

function cmdNerf() {
}

function cmdFormula() {
}

function cmdExamine() {
}

function cmdLook() {
}

function cmdViewLoc() {
}

function cmdDrop() {
}

function cmdTake() {
}

function cmdLocDesc() {
}

function cmdExplored() {
}

function cmdSetHome() {
}

function cmdGoHome() {
}

function cmdScout() {
}

function cmdUseLoc() {
}

function cmdMove() {
}

function cmdHike() {
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
	CreateCommand('worn', 'worn [equip slot]\t\tInspect an equipped item.', cmdWorn, Rpg, { maxArgs: 1 });
	CreateCommand('compare', 'compare <pack item> - Compare inventory item to worn item.',
		cmdCompare, list, { minArgs: 1, maxArgs: 1 });

	// ITEMS
	CreateCommand('destroy', 'destroy <item_number|item_name>\t\tDestroys an item. This action cannot be undone.',
		cmdDestroy, list, { minArgs: 1, maxArgs: 2 });
	CreateCommand('inspect', 'inspect <item_number|item_name>', cmdInspect, list, { maxArgs: 1 });
	CreateCommand('viewitem', 'viewitem <item_number|item_name> : View an item.', cmdViewItem, Rpg, { maxArgs: 1 });
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