import { NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('eat', 'Eat food from inventory')
		.addStringOption(StrOpt('what', 'object to eat')),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (char) {
			const what = m.options.getString('what', true);
			return m.reply(rpg.game.eat(char, what));
		}

	}
}