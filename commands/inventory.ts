import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { ReplyBlock } from "rpg/display/display";
import { ItemMenu } from "rpg/display/items";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('inv', 'View a character\'s inventory')
		.addStringOption(StrOpt('who', 'Character\'s inventory to view. Defaults to own inventory')),
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

		return ReplyBlock(m,
			char.name + 'Inventory:\n' + ItemMenu(char.inv));

	}
})