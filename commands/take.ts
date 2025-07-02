import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { PickItemButtons } from "rpg/actions";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('take', 'Take single item or range of items from ground.')
		.addStringOption(StrOpt('start', 'Starting item to take'))
		.addStringOption(StrOpt('end', 'End item to take')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const start = m.options.getString('start');

		if (!start) {
			const loc = await rpg.world.getOrGen(char.loc);

			return SendPrivate(m, 'Take what item?', {
				components: PickItemButtons('take', loc.inventory, 'start')
			});
		}

		const end = m.options.getString('end');
		await SendPrivate(m, await rpg.game.take(char, start, end));


	}
})