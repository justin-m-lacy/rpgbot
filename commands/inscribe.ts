import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('inscribe', 'Inscribe inventory item with a message')
		.addStringOption(StrOpt('what', 'Item to inscribe').setRequired(true))
		.addStringOption(StrOpt('text', 'Text to inscribe')),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const what = m.options.getString('what', true);
		const script = m.options.getString('text') ?? '';

		if (!what) return m.reply('Inscribe which inventory item?');

		return m.reply(rpg.game.inscribe(char, what, script));


	}
} as CommandData<Rpg>