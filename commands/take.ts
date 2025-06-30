import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('take', 'Take single item or range of items from ground.')
		.addStringOption(StrOpt('start', 'Starting item to take').setRequired(true))
		.addStringOption(StrOpt('end', 'End item to take')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const start = m.options.getString('start', true);
		const end = m.options.getString('end');

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		await SendPrivate(m, await rpg.game.take(char, start, end));


	}
})