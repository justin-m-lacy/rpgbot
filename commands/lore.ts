import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { ReplyBlock } from "rpg/display/display";
import { GetLore } from "rpg/game";

export default NewCommand({
	data: CommandData('lore', 'Get information on creature, class, race, or item')
		.addStringOption(StrOpt('what', 'Name of lore entry')),
	async exec(m: ChatCommand) {

		const what = m.options.getString('what', true);
		if (!what) return SendPrivate(m, 'What do you want to know about?');

		return ReplyBlock(m, GetLore(what));

	}
})