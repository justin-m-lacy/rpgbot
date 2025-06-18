import { NewCommand, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('locdesc', 'Set location description')
		.addStringOption(StrOpt('desc', 'Description of location').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const desc = m.options.getString('desc', true);

		const resp = await rpg.world.setDesc(char, desc);// m.attachments?.first()?.proxyURL);
		if (resp) return m.reply(resp);


	}
} as Command<Rpg>