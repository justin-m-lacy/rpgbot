import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('revive', 'Attempt to revive character.')
		.addStringOption(StrOpt('who', 'Character to revive.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const who = m.options.getString('who');
		const t = who ? await rpg.loadChar(who) : char;
		if (!t) return;

		await SendBlock(m, rpg.game.revive(char, t));

	}
})