import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('give', 'Give item to another character')
		.addStringOption(StrOpt('who', 'Character to give item to').setRequired(true))
		.addStringOption(StrOpt('what', 'Which item to give')),
	async exec(m: ChatAction, rpg: Rpg) {

		const src = await rpg.userCharOrErr(m, m.user);
		if (!src) return;

		const who = m.options.getString('who', true);
		const what = m.options.getString('what', true);

		const dest = await rpg.loadChar(who);
		if (!dest) return m.reply(`'${who}' does not exist.`);

		return m.reply(rpg.game.give(src, dest, what));

	}
} as CommandData<Rpg>