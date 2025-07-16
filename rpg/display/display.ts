import { type ChatCommand } from "@/bot/cmd-wrapper";
import { EmbedBuilder, MessageFlags, type InteractionReplyOptions } from "discord.js";
import { getNextExp } from "rpg/char/level";
import { getEvil, StatIds, type StatKey } from "rpg/char/stats";
import { smallNum } from "rpg/util/format";
import { Char } from '../char/char';

const MsgMax = 1950;

export const BlockText = (s: string) => '```' + s + '```';

export const SendEmbed = async (m: ChatCommand, s: string, e?: string) => m.reply(
	{
		content: '```' + s + '```',
		embeds: e ? [
			new EmbedBuilder({ image: { url: e } })
		] : undefined
	});

export const ReplyEmbed = async (m: ChatCommand, s: string, e?: string) => m.reply(
	{
		content: '```' + s + '```',
		flags: MessageFlags.Ephemeral,
		embeds: e ? [
			new EmbedBuilder({ image: { url: e } })
		] : undefined
	});

export const SendPrivate = (m: ChatCommand, str: string, opts?: InteractionReplyOptions) => {
	return str ? m.reply({
		content: str.length < MsgMax ? str : str.slice(0, MsgMax),
		flags: MessageFlags.Ephemeral,
		...opts
	}) : undefined;
}

export const SendBlock = async (m: { reply(s: string): Promise<any> }, s: string) => {
	if (s.length > MsgMax) s = s.slice(0, MsgMax);

	return s ? m.reply('```' + s + '```') : undefined;
}

export const ReplyBlock = async (m: ChatCommand,
	str: string,
	opts?: InteractionReplyOptions): Promise<any> => {

	return m.reply({
		content: '```' + str + '```',
		flags: MessageFlags.Ephemeral,
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

/**
 * 
 * @param chan 
 * @param char 
 * @param opts - reply options.
 * @param prefix 
 * @returns 
 */
export const EchoChar = async function (chan: ChatCommand, char: Char,
	opts?: InteractionReplyOptions | null, prefix: string = '') {

	const desc = CharLongDesc(char);
	return chan.reply(
		{
			content: prefix + '```' + `${char.name} is a` +
				(IsVowel(desc.charAt(0)) ? 'n ' : ' ') +
				desc + '```',
			...opts
		}

	);

}

export const CharLongDesc = (char: Char): string => {

	let desc = `level ${char.level.value} ${getEvil(+char.evil)} ${char.race.name} ${char.cls!.name} [${char.state}]`;
	desc += `\nage: ${smallNum(char.age)} sex: ${char.sex} gold: ${Math.floor(char.gold)} exp: ${Math.floor(char.exp)}/ ${getNextExp(char)}`;
	desc += `\nhp: ${smallNum(char.hp)}/${Math.ceil(char.hp.max.valueOf())} armor: ${Math.floor(char.armor.valueOf())}`;
	desc += statString(char);

	if (char.spentPoints < char.statPoints) desc += '\n' + (char.statPoints - char.spentPoints) + ' stat points available.';

	return desc;

}

const statString = (char: Char) => {

	let id = StatIds[0];
	let res = '';

	const len = StatIds.length;

	for (let i = 0; i < len; i++) {

		id = StatIds[i];
		const stat = char.stats[id as StatKey];

		res += `\n${id}: ` + (stat.value ?? 0) + (stat.base != stat.value ? ` (${stat.base} base)` : '');

	}
	return res;

}

