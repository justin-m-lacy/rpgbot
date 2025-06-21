import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('inscribe', 'Inscribe inventory item with a message')
		.addStringOption(StrOpt('what', 'Item to inscribe').setRequired(true))
		.addStringOption(StrOpt('text', 'Text to inscribe')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const what = m.options.getString('what', true);
		const script = m.options.getString('text') ?? '';

		if (!what) return SendPrivate(m, 'Inscribe which inventory item?');

		return SendPrivate(m, rpg.game.inscribe(char, what, script));


	}
})