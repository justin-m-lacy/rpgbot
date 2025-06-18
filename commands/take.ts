import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('take', 'Take single item or range of items from ground.')
		.addStringOption(StrOpt('start', 'Starting item to take').setRequired(true))
		.addStringOption(StrOpt('end', 'End item to take')),
	async exec(m: ChatAction, rpg: Rpg) {

		const start = m.options.getString('start', true);
		const end = m.options.getString('end');

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		await m.reply(await rpg.game.take(char, start, end));


	}
} as CommandData<Rpg>