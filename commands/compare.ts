import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('compare', 'Compare item in inventory to current worn item')
		.addStringOption(StrOpt('what', 'Item to equip').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)

		if (char) {
			const what = m.options.getString('what', true);

			if (!what) return m.reply('Compare what item?');
			return SendBlock(m, rpg.game.compare(char, what));
		}

	}
} as CommandData<Rpg>