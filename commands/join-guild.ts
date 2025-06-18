import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('joinguild', 'Join guild')
		.addStringOption(StrOpt('guild', 'Name of guild to join').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const gname = m.options.getString('guild', true);

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await SendBlock(m, await rpg.game.joinGuild(char, gname));


	}
} as CommandData<Rpg>