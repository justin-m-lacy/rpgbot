import { NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('brew', 'Attempt to brew potion')
		.addStringOption(StrOpt('potion', 'Potion to brew').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const potion = m.options.getString('potion', true);

		if (!potion) return m.reply('Brew what potion?');

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		//const a = m.attachments.first();
		const res = rpg.game.brew(char, potion);

		return SendBlock(m, res);

	}
}