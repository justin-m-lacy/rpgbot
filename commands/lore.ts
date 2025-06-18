import { NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { GetLore } from "rpg/game";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('lore', 'Get information on creature, class, race, or item')
		.addStringOption(StrOpt('what', 'Name of lore entry').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const what = m.options.getString('what', true);
		if (!what) return m.reply('What do you want to know about?');

		return SendBlock(m, GetLore(what));

	}
}