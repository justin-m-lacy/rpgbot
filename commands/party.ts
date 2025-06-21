import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import type { Char } from "rpg/char/char";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('party', 'join party, invite to party, or show party status.')
		.addStringOption(StrOpt('who', 'player to invite to party or player\'s party to join')),
	async exec(m: ChatCommand, rpg: Rpg) {
		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const who = m.options.getString('who');

		let t: Char | undefined;
		if (who) {
			t = await rpg.loadChar(who);
			if (!t) return;
		}

		return SendBlock(m, await rpg.game.party(char, t));

	}
})