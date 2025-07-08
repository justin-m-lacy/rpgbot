import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('destroy', 'Destroy item or range of items from inventory.')
		.addStringOption(StrOpt('start', 'Starting item to destroy').setRequired(true))
		.addStringOption(StrOpt('end', 'End item to destroy')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user)
		if (!char) return;

		const start = m.options.getString('start');
		const end = m.options.getString('end');

		if (!start) return SendPrivate(m, 'Destroy which inventory item?');

		return SendPrivate(m, await rpg.game.action('destroy', char, start, end));

	}
})