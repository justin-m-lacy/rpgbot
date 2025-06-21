import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('eat', 'Eat food from inventory')
		.addStringOption(StrOpt('what', 'object to eat')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (char) {
			const what = m.options.getString('what', true);
			return SendPrivate(m, rpg.game.eat(char, what));
		}

	}

});