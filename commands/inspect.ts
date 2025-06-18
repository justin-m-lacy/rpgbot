import { NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('inspect', 'Inspect inventory item')
		.addStringOption(StrOpt('what', 'Item to view').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const what = m.options.getString('what');
		if (!what) return m.reply('Inspect which inventory item?');

		let item = char.getItem(what);
		if (Array.isArray(item)) item = item[0];
		if (!item) return m.reply('Item not found.');
		return m.reply(item.getDetails());

	}
}