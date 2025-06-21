import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendPrivate } from "@/utils/display";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('brew', 'Attempt to brew potion')
		.addStringOption(StrOpt('potion', 'Potion to brew').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const potion = m.options.getString('potion', true);

		if (!potion) return SendPrivate(m, 'Brew what potion?');

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		//const a = m.attachments.first();
		const res = rpg.game.brew(char, potion);

		return SendBlock(m, res);

	}
})