import type { DiscordBot } from '@/bot/discordbot';
import { InitItems } from '../rpg/builders/itemgen';
import { LoadActions } from '../rpg/magic/action';
import { LoadEffects } from '../rpg/magic/effects';
import { InitClasses, InitRaces } from '../rpg/parsers/classes';

export const InitGame = async (bot: DiscordBot) => {

	await Promise.all([InitRaces(), InitClasses(), InitItems(), LoadEffects(), LoadActions()]);

}