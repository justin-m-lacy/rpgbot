import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { ReplyBlock, SendPrivate } from "rpg/display/display";
import { GetClass, GetRace } from "rpg/parsers/parse-class";


const GetLore = (wot?: string) => {

	const val = GetRace(wot) ?? GetClass(wot);
	if (val) return wot + ': ' + val.desc;

	return 'Unknown entity: ' + wot;

}

export default NewCommand({
	data: CommandData('lore', 'Get information on creature, class, race, or item')
		.addStringOption(StrOpt('what', 'Name of lore entry')),
	async exec(m: ChatCommand) {

		const what = m.options.getString('what', true);
		if (!what) return SendPrivate(m, 'What do you want to know about?');

		return ReplyBlock(m, GetLore(what));

	}
})