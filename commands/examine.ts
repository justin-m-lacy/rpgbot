import { NewCommand, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('ex', 'Examine character or monster.')
		.addStringOption(StrOpt('what', 'Character or monster to examine.').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;
		const what = m.options.getString('what', true);
		await SendBlock(m, await rpg.world.examine(char, what));

	}
} as Command<Rpg>