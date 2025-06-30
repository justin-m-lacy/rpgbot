import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('guildjoin', 'Join guild')
		.addStringOption(StrOpt('guild', 'Name of guild to join').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const gname = m.options.getString('guild', true);

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await SendBlock(m, await rpg.game.joinGuild(char, gname));


	}
})