import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('cook', 'Attempt to cook item in inventory')
		.addStringOption(StrOpt('what', 'item to cook')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (char) {
			const what = m.options.getString('what', true);
			return m.reply(rpg.game.cook(char, what));
		}

	}
})