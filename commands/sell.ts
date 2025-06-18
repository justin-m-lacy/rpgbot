import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('sell', 'Sell items from inventory')
		.addStringOption(StrOpt('start', 'Starting item to sell').setRequired(true))
		.addStringOption(StrOpt('end', 'End item to sell')),
	async exec(m: ChatAction, rpg: Rpg) {

		const start = m.options.getString('start', true);
		const end = m.options.getString('end');

		const src = await rpg.userCharOrErr(m, m.user);
		if (!src) return;

		return SendBlock(m, rpg.game.sell(src, start, end));

	}
} as CommandData<Rpg>