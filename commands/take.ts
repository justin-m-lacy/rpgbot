import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { InventoryButtons } from "rpg/components";
import { SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('take', 'Take single item or range of items from ground.')
		.addStringOption(StrOpt('start', 'First item to take'))
		.addStringOption(StrOpt('end', 'Optional end item to take.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		let start: string | number | null = m.options.getString('start');
		if (!start) {
			const loc = await rpg.world.getOrGen(char.at);

			if (loc.items.length === 0) {
				return SendPrivate(m, 'Nothing here to take.');
			} else if (loc.items.length === 1) {
				start = 1;
			} else {
				return SendPrivate(m, 'Take which item?', {
					components: InventoryButtons('take', loc.inv, 'start')
				});
			}
		}

		const end = m.options.getString('end');
		await SendPrivate(m, await rpg.game.action('take', char, start, end));


	}
})