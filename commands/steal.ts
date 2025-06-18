import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('steal', 'Attempt to steal from character')
		.addStringOption(StrOpt('who', 'Character to steal from').setRequired(true))
		.addStringOption(StrOpt('what', 'What to steal')),
	async exec(m: ChatAction, rpg: Rpg) {

		const src = await rpg.userCharOrErr(m, m.user);
		if (!src) return;

		const who = m.options.getString('who', true);
		const what = m.options.getString('what');

		const dest = await rpg.loadChar(who);
		if (!dest) return m.reply(`'${who}' not seen here.`);

		const result = await rpg.game.steal(src, dest, what);
		await SendBlock(m, result);


	}
} as CommandData<Rpg>