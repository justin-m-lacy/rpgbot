import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('sell', 'Sell items from inventory')
		.addStringOption(StrOpt('start', 'Starting item to sell').setRequired(true))
		.addStringOption(StrOpt('end', 'End item to sell')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const start = m.options.getString('start', true);
		const end = m.options.getString('end');

		const src = await rpg.myCharOrErr(m, m.user);
		if (!src) return;

		return SendBlock(m, await rpg.game.action('sell', src, start, end));

	}
})