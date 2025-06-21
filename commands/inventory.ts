import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendPrivate } from "@/utils/display";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('inv', 'View a character\'s inventory')
		.addStringOption(StrOpt('who', 'Character inventory to view. Defaults to own inventory').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		let char;

		const who = m.options.getString('who');

		if (who) {

			char = await rpg.loadChar(who);
			if (!char) return SendPrivate(m, `'${who}' not found.`);


		} else {

			char = await rpg.userCharOrErr(m, m.user);
			if (!char) return;

		}

		return SendBlock(m, `${char.name} Inventory:\n${char.inv.getMenu()}`);

	}
})