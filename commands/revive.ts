import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('revive', 'Attempt to revive character.')
		.addStringOption(StrOpt('who', 'Character to revive.')),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const who = m.options.getString('who');
		const t = who ? await rpg.loadChar(who) : char;
		if (!t) return;

		await SendBlock(m, rpg.game.revive(char, t));

	}
} as CommandData<Rpg>