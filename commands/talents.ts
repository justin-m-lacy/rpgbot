import { NewCommand, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('talents', 'View a character\'s talents')
		.addStringOption(StrOpt('who', 'Character to view')),
	async exec(m: ChatAction, rpg: Rpg) {

		let char;

		const who = m.options.getString('who');

		if (!who) {
			char = await rpg.userCharOrErr(m, m.user);
			if (!char) return;
		} else {
			char = await rpg.loadChar(who);
			if (!char) return m.reply(who + ' not found on server. D:');
		}

		await SendBlock(m, char.getTalents());

	}
} as Command<Rpg>