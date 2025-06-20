import { CommandData, NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('drop', 'Drop item or range of items from inventory.')
		.addStringOption(StrOpt('start', 'Starting item to drop').setRequired(true))
		.addStringOption(StrOpt('end', 'End item to drop')),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const start = m.options.getString('start', true);
		const end = m.options.getString('end');

		return SendPrivate(m, await rpg.game.drop(char, start, end));



	}
})