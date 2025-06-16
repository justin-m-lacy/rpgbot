import { DiscordBot } from "@/bot/discordbot";
import { Message } from "discord.js";

let answers: string[];

export const initPlugin = (bot: DiscordBot) => {
	bot.dispatch.add('8ball', '8ball [question]', cmd8Ball, { maxArgs: 1 });
}

const cmd8Ball = async (m: Message<true>) => {

	if (!answers) {
		answers = (await import('./answers.json', { with: { type: 'json' } })).default
	}
	if (answers.length === 0) return;

	const ind = Math.floor(answers.length * Math.random());
	m.channel.send(answers[ind]);

}