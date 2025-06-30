import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('quaff', 'Quaff potion or drink from inventory')
		.addStringOption(StrOpt('what', 'Potion to quaff')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (char) {
			const what = m.options.getString('what', true);
			return m.reply(rpg.game.quaff(char, what));
		}

	}
})