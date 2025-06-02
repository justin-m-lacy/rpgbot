import { DiscordBot } from '@/bot/discordbot';
import { archGet } from "@/utils/fetch";
import { Message } from "discord.js";

const ApiUrl = "https://animechan.vercel.app/api/random";

export const initPlugin = (bot: DiscordBot) => {

	bot.dispatch.add('aquote', 'aquote - get inspirational anime quote.', cmdGetQuote, { maxArgs: 0 });

}

async function cmdGetQuote(m: Message<true>, query?: string) {

	if (query) return;

	try {
		const data = await archGet<{ quote: string, character: string, anime: string }>(ApiUrl);
		const result = `"${data.quote}" - ${data.character} (${data.anime})`;
		return m.channel.send(result);

	} catch (err) {
		return m.channel.send(`Shinji gave up - ${err};`)
	}

}