import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { OptionButtons } from "rpg/components";
import { SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('use', 'Use item in inventory')
		.addStringOption(StrOpt('item', 'Item to use')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user)
		if (char) {
			const what = m.options.getString('what');

			if (!what) {

				return SendPrivate(m, 'Use what item?', {
					components: OptionButtons('use',
						char.inv.items, 'what')
				})
			}

			return m.reply(await rpg.game.exec('quaff', char, what));
		}

	}
})