import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import type { Char } from "rpg/char/char";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('party', 'join party, invite to party, or show party status.')
		.addStringOption(StrOpt('who', 'player to invite to party or player\'s party to join')),
	async exec(m: ChatAction, rpg: Rpg) {
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
} as CommandData<Rpg>