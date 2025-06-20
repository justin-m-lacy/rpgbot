import { CommandData, NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('listchars', 'list all characters')
		.addStringOption(StrOpt('user', 'user name to list characters for')),
	async exec(m: ChatAction, rpg: Rpg) {
		try {
			const list = await rpg.context.getDataList(Rpg.RpgDir + '/chars');
			if (!list) return SendPrivate(m, 'Could not get char list.');

			return SendPrivate(m, list.join(', '));

		} catch (e) { console.log(e); }

	}
})