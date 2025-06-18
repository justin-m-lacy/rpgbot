import { NewCommand, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('mkguild', 'Create new guild')
		.addStringOption(StrOpt('guild', 'New guild name').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const gname = m.options.getString('guild', true);

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await SendBlock(m, await rpg.game.mkGuild(char, gname));

	}
} as Command<Rpg>