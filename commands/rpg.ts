import { type CommandData } from '@/bot/command';
import type { DiscordBot } from '@/bot/discordbot';
import { InitItems } from '../rpg/builders/itemgen';
import { LoadActions } from '../rpg/magic/action';
import { LoadEffects } from '../rpg/magic/effects';
import { InitClasses, InitRaces } from '../rpg/parsers/classes';


export function GetCommands() {

	const list: CommandData[] = [];

	// MOVE
	/*CreateCommand('move', 'move <direction>', cmdMove, list, { maxArgs: 1 });
	CreateCommand('north', 'north', cmdMove, list, { maxArgs: 0, args: ['north'], alias: 'n' });
	CreateCommand('south', 'south', cmdMove, list, { maxArgs: 0, args: ['south'], alias: 's' });
	CreateCommand('east', 'east', cmdMove, list, { maxArgs: 0, args: ['east'], alias: 'e' });
	CreateCommand('west', 'west', cmdMove, list, { maxArgs: 0, args: ['west'], alias: 'w' });*/

	return list;

}


export const InitGame = async (bot: DiscordBot) => {

	await Promise.all([InitRaces(), InitClasses(), InitItems(), LoadEffects(), LoadActions()]);

}