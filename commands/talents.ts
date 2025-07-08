import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('talents', 'View a character\'s talents')
		.addStringOption(StrOpt('who', 'Character to view')),
	async exec(m: ChatCommand, rpg: Rpg) {

		let char;

		const who = m.options.getString('who');

		if (!who) {
			char = await rpg.myCharOrErr(m, m.user);
			if (!char) return;
		} else {
			char = await rpg.loadChar(who);
			if (!char) return SendPrivate(m, who + ' not found on server. D:');
		}

		await SendBlock(m, char.getTalents());

	}
})