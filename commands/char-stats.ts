import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { getHistory } from "rpg/events";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('charstats', 'View a character\'s stats')
		.addStringOption(StrOpt('who', 'Character whose stats to view')),
	async exec(m: ChatAction, rpg: Rpg) {

		let char;

		const who = m.options.getString('who');

		if (!who) {
			char = await rpg.userCharOrErr(m, m.user);
			if (!char) return;
		} else {
			char = await rpg.loadChar(who);
			if (!char) return m.reply(who + ' not found on server. :O');
		}

		await SendBlock(m, getHistory(char));

	}
} as CommandData<Rpg>