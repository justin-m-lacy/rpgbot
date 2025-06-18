import { NewCommand, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('destroy', 'Destroy item or range of items from inventory.')
		.addStringOption(StrOpt('start', 'Starting item to destroy').setRequired(true))
		.addStringOption(StrOpt('end', 'End item to destroy')),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const start = m.options.getString('start');
		const end = m.options.getString('end');

		if (!start) return m.reply('Destroy which inventory item?');

		return m.reply(rpg.game.destroy(char, start, end));

	}
} as Command<Rpg>