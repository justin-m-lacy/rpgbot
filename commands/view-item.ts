import { CommandData, NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { ReplyEmbed } from "@/embeds";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('viewitem', 'View item in inventory')
		.addStringOption(StrOpt('what', 'Item to view').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const what = m.options.getString('what');

		if (!what) return SendPrivate(m, 'View which inventory item?');

		const item = char.getItem(what);
		if (!item) return SendPrivate(m, 'Item not found.');

		const view = Array.isArray(item) ? item[0].getView() : item.getView();
		if (view[1]) {

			return ReplyEmbed(m, view[1], view[0]);
		}
		else await SendPrivate(m, view[0]);


	}
})