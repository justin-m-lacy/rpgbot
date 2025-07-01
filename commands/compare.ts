import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('compare', 'Compare item in inventory to current worn item')
		.addStringOption(StrOpt('what', 'Item to equip').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)

		if (char) {
			const what = m.options.getString('what', true);

			if (!what) return SendPrivate(m, 'Compare what item?');
			return ReplyBlock(m, rpg.game.compare(char, what));
		}

	}
})