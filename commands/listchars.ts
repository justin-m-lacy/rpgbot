import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('listchars', 'list all characters')
		.addStringOption(StrOpt('user', 'user name to list characters for')),
	async exec(m: ChatCommand, rpg: Rpg) {
		try {
			const list = await rpg.context.getDataList(Rpg.RpgDir + '/chars');
			if (!list) return SendPrivate(m, 'Could not get char list.');

			return SendPrivate(m, list.join(', '));

		} catch (e) { console.log(e); }

	}
})