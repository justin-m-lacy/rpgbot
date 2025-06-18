import { NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('quaff', 'Quaff potion or drink from inventory')
		.addStringOption(StrOpt('what', 'Potion to quaff')),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (char) {
			const what = m.options.getString('what', true);
			return m.reply(rpg.game.quaff(char, what));
		}

	}
}