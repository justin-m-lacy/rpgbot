import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { ReplyEmbed } from "@/embeds";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('viewitem', 'View item in inventory')
		.addStringOption(StrOpt('what', 'Item to view').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const what = m.options.getString('what');

		if (!what) return m.reply('View which inventory item?');

		const item = char.getItem(what);
		if (!item) return m.reply('Item not found.');

		const view = Array.isArray(item) ? item[0].getView() : item.getView();
		if (view[1]) {

			return ReplyEmbed(m, view[1], view[0]);
		}
		else await m.reply(view[0]);


	}
} as CommandData<Rpg>