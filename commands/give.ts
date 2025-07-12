import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('give', 'Give item to another character')
		.addStringOption(StrOpt('who', 'Character to give item to').setRequired(true))
		.addStringOption(StrOpt('what', 'Which item to give')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const src = await rpg.myCharOrErr(m, m.user);
		if (!src) return;

		const who = m.options.getString('who', true);
		const what = m.options.getString('what', true);

		const dest = await rpg.loadChar(who);
		if (!dest) return SendPrivate(m, `'${who}' does not exist.`);

		return m.reply(await rpg.game.exec('give', src, dest, what));

	}
})