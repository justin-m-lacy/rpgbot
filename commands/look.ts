import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('look', 'Look at item on ground.')
		.addStringOption(StrOpt('what', 'Item on ground to look at.').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const what = m.options.getString('what', true);

		return SendBlock(m, await rpg.world.look(char, what));

	}
})