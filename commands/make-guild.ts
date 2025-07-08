import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('mkguild', 'Create new guild')
		.addStringOption(StrOpt('guild', 'New guild name').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const gname = m.options.getString('guild', true);

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		await SendBlock(m, await rpg.game.mkGuild(char, gname));

	}
})