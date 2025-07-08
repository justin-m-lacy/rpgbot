import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('revive', 'Attempt to revive character.')
		.addStringOption(StrOpt('who', 'Character to revive.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const who = m.options.getString('who');

		if (!who && char.isAlive()) {

			// get char list at location.

		}

		const t = who ? await rpg.loadChar(who) : char;
		if (!t) return;

		await SendBlock(m, await rpg.game.action('revive', char, t));

	}
})