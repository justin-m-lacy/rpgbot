import { NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import type { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('listchars', 'list all characters')
		.addStringOption(StrOpt('user', 'user name to list characters for')),
	async exec(m: ChatAction, rpg: Rpg) {
		try {
			const list = await rpg.context.getDataList(RPG_DIR + '/chars');
			if (!list) return m.reply('Could not get char list.');

			return m.reply(list.join(', '));

		} catch (e) { console.log(e); }

	}
}