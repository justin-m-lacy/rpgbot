import { type ChatCommand } from "@/bot/cmd-wrapper";
import type { ChatAction } from "@/bot/command";
import { EmbedBuilder, Message, type InteractionReplyOptions } from "discord.js";
import { getNextExp } from "rpg/char/level";
import { getEvil, StatIds, type StatKey } from "rpg/char/stats";
import { Char } from '../char/char';

export const BlockText = (s: string) => '```' + s + '```';

export const SendEmbed = async (m: Message | ChatAction, s: string, e: string) => m.reply(
	{
		content: '```' + s + '```',
		embeds: [
			new EmbedBuilder({ image: { url: e } })
		]
	});

export const SendBlock = async (m: { reply(s: string): Promise<any> }, s: string) =>
	m.reply('```' + s + '```');

export const ReplyBlock = async (m: ChatCommand,
	str: string,
	opts?: InteractionReplyOptions): Promise<any> => {

	return m.reply({
		content: '```' + str + '````',
		...opts
	});

}

/**
 * Checks if character is a vowel.
 * @param c character to test. 
 */
export const IsVowel = (c: string) => {

	c = c.toLowerCase();
	return c === 'a' || c === 'e' || c === 'i' || c === 'o' || c === 'u';
}

export const EchoChar = async function (chan: Message | ChatCommand, char: Char, prefix: string = '') {

	const desc = CharLongDesc(char);
	return chan.reply(
		prefix + '```' + `${char.name} is a` +
		(IsVowel(desc.charAt(0)) ? 'n ' : ' ') +
		desc + '```'
	);

}

export const CharLongDesc = (char: Char): string => {

	let desc = `level ${char.level.value} ${getEvil(+char.evil)} ${char.race.name} ${char.cls!.name} [${char.state}]`;
	desc += `\nage: ${char.age.valueOf()} sex: ${char.sex} gold: ${char.gold} exp: ${char.exp}/ ${getNextExp(char)}`;
	desc += `\nhp: ${char.hp.valueOf()}/${char.hp.max.valueOf()} armor: ${char.armor.valueOf()}\n`;
	desc += statString(char);

	if (char.spentPoints < char.statPoints) desc += '\n' + (char.statPoints - char.spentPoints) + ' stat points available.';

	return desc;

}

const statString = (char: Char) => {

	let stat = StatIds[0];
	let str = stat + ': ' + (char.stats[stat as StatKey] ?? 0);

	const len = StatIds.length;

	for (let i = 1; i < len; i++) {

		stat = StatIds[i];
		str += '\n' + stat + ': ' + (char.stats[stat as StatKey] ?? 0);

	}
	return str;

}

