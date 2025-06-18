import { NewCommand, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('track', 'Track another character')
		.addStringOption(StrOpt('who', 'Character to track').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const src = await rpg.userCharOrErr(m, m.user);
		if (!src) return;

		const who = m.options.getString('who', true);

		const dest = await rpg.loadChar(who);
		if (!dest) return m.reply(`'${who}' does not exist.`);

		await SendBlock(m, rpg.game.track(src, dest));


	}
} as Command<Rpg>