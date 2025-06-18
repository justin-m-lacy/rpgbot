import { NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('cook', 'Attempt to cook item in inventory')
		.addStringOption(StrOpt('what', 'item to cook')),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (char) {
			const what = m.options.getString('what', true);
			return m.reply(rpg.game.cook(char, what));
		}

	}
}