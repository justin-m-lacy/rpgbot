import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('useloc', 'Use feature at current location')
		.addStringOption(StrOpt('what', 'Feature to use.').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const what = m.options.getString('what', true);
		return SendBlock(m, await rpg.game.exec('useloc', char, what));

	}
})