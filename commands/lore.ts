import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { GetLore } from "rpg/game";

export default NewCommand({
	data: CommandData('lore', 'Get information on creature, class, race, or item')
		.addStringOption(StrOpt('what', 'Name of lore entry').setRequired(true)),
	async exec(m: ChatCommand) {

		const what = m.options.getString('what', true);
		if (!what) return m.reply('What do you want to know about?');

		return SendBlock(m, GetLore(what));

	}
})