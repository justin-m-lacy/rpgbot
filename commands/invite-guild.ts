import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('invite', 'Invite character to guild')
		.addStringOption(StrOpt('who', 'Character to invite to guild').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const who = m.options.getString('who', true);
		const t = await rpg.loadChar(who);
		if (!t) return;

		return SendBlock(m, await rpg.game.guildInv(char, t));

	}
} as CommandData<Rpg>