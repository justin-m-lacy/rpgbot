import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('track', 'Track another character')
		.addStringOption(StrOpt('who', 'Character to track').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const src = await rpg.myCharOrErr(m, m.user);
		if (!src) return;

		const who = m.options.getString('who', true);

		const dest = await rpg.loadChar(who);
		if (!dest) return m.reply(`'${who}' does not exist.`);

		await SendBlock(m, await rpg.game.exec('track', src, dest));


	}
})