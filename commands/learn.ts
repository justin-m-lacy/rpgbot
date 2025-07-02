import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { Char } from "rpg/char/char";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

/**
 * Learn new spell.
 */
export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('learn', 'Learn spell from a spellbook.')
		.addStringOption(StrOpt('spell', 'Spell to learn.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const who = m.options.getString('spell');

		let t: Char | undefined;
		if (who) {
			t = await rpg.loadChar(who);
			if (!t) return;
		}

		return SendBlock(m, rpg.game.setLeader(char, t));

	}
})