import { CommandData, NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { PermissionFlagsBits } from "discord.js";
import { Rpg } from "rpg/rpg";
import { nerfItems } from "rpg/trade";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('nerf', 'Nerf character.')
		.addStringOption(StrOpt('who', 'Character to make leader.').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async exec(m: ChatAction, rpg: Rpg) {

		const who = m.options.getString('who', true);

		const char = await rpg.loadChar(who);
		if (!char) return;

		if (!rpg.context.isOwner(m.user)) return m.reply('You do not have permission to do that.');

		return m.reply(nerfItems(char));

	}
})