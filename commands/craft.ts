import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('craft', 'Attempt to craft object', [
		StrOpt('what', 'What to craft').setRequired(true),
		StrOpt('desc', 'Description of item')
	]),
	async exec(m: ChatCommand, rpg: Rpg) {

		const what = m.options.getString('what', true);
		const desc = m.options.getString('desc', true);

		if (!what) return m.reply('Crafted item must have a name.');
		if (!desc) return m.reply('Crafted items require a description.');

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		//const a = m.attachments.first();
		const res = rpg.game.craft(char, what, desc);

		return SendBlock(m, res);


	}
})