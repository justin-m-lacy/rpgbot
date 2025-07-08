import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { PickItemButtons } from "rpg/components";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('quaff', 'Quaff potion or drink from inventory')
		.addStringOption(StrOpt('what', 'Potion to quaff')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user)
		if (char) {
			const what = m.options.getString('what');

			if (!what) {

				return SendPrivate(m, 'Quaff what item?', {
					components: PickItemButtons('quaff', char.inv, 'what')
				})
			}

			return m.reply(await rpg.game.action('quaff', char, what));
		}

	}
})