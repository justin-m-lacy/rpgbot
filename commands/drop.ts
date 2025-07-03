import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { PickItemButtons } from "rpg/components";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('drop', 'Drop item or range of items from inventory.')
		.addStringOption(StrOpt('start', 'Starting item to drop'))
		.addStringOption(StrOpt('end', 'End item to drop')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const start = m.options.getString('start');

		if (!start) {

			return SendPrivate(m, 'Drop which item?', {
				components: PickItemButtons('drop', char.inv, 'start')
			});
		}

		const end = m.options.getString('end');

		return SendPrivate(m, await rpg.game.action('drop', char, start, end));



	}
})