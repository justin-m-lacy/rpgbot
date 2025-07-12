import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { OptionButtons } from "rpg/components";
import { ItemType } from "rpg/items/types";
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

				return SendPrivate(m, 'Quaff what potable?', {
					components: OptionButtons('quaff',
						char.inv.items.filter(v => v.type === ItemType.Potion), 'what')
				})
			}

			return m.reply(await rpg.game.action('quaff', char, what));
		}

	}
})