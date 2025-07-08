import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('ex', 'Examine item at location.')
		.addStringOption(StrOpt('what', 'Item on ground.').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;
		const what = m.options.getString('what', true);
		await ReplyBlock(m, await rpg.world.examine(char, what));

	}
})