import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('ex', 'Examine character or monster.')
		.addStringOption(StrOpt('what', 'Character or monster to examine.').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;
		const what = m.options.getString('what', true);
		await SendBlock(m, await rpg.world.examine(char, what));

	}
})