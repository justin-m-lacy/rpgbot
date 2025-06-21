import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendPrivate } from "@/utils/display";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('steal', 'Attempt to steal from character')
		.addStringOption(StrOpt('who', 'Character to steal from').setRequired(true))
		.addStringOption(StrOpt('what', 'What to steal')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const src = await rpg.userCharOrErr(m, m.user);
		if (!src) return;

		const who = m.options.getString('who', true);
		const what = m.options.getString('what');

		const dest = await rpg.loadChar(who);
		if (!dest) return SendPrivate(m, `'${who}' not seen here.`);

		const result = await rpg.game.steal(src, dest, what);
		await SendBlock(m, result);

	}
})