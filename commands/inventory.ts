import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('inv', 'View a character\'s inventory')
		.addStringOption(StrOpt('who', 'Character inventory to view. Defaults to own inventory').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		let char;

		const who = m.options.getString('who');

		if (who) {

			char = await rpg.loadChar(who);
			if (!char) return m.reply(`'${who}' not found.`);


		} else {

			char = await rpg.userCharOrErr(m, m.user);
			if (!char) return;

		}

		return SendBlock(m, `${char.name} Inventory:\n${char.inv.getMenu()}`);

	}
} as CommandData<Rpg>