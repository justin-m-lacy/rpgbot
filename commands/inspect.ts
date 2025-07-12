import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { CharItemActions, InventoryButtons } from "rpg/components";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('inspect', 'Inspect inventory item')
		.addStringOption(StrOpt('item', 'Inventory item to view')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user)
		if (!char) return;

		const what = m.options.getString('item');
		if (!what) {
			return SendPrivate(m, 'Inspect which inventory item?', {
				components: InventoryButtons('inspect', char.inv)
			});
		}

		let item = char.getItem(what);
		if (Array.isArray(item)) item = item[0];
		if (!item) return SendPrivate(m, 'Item not found.');
		return SendPrivate(m, item.getDetails(char), {
			components: [CharItemActions(item)]
		});

	}
})