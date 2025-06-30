import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { Char } from "rpg/char/char";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('leader', 'Set party leader or get name of current leader.')
		.addStringOption(StrOpt('who', 'Character to make leader.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const who = m.options.getString('who');

		let t: Char | undefined;
		if (who) {
			t = await rpg.loadChar(who);
			if (!t) return;
		}

		return SendBlock(m, rpg.game.setLeader(char, t));

	}
})