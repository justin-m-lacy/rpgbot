import { NewCommand, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('look', 'Look at item on ground.')
		.addStringOption(StrOpt('what', 'Item on ground to look at.').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const what = m.options.getString('what', true);

		return SendBlock(m, await rpg.world.look(char, what));

	}
} as Command<Rpg>