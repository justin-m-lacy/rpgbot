import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { WorldItemActions } from "rpg/actions";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('look', 'Look at item on ground.')
		.addStringOption(StrOpt('what', 'Item on ground to look at.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const what = m.options.getString('what');

		const loc = await rpg.world.getOrGen(char.loc);
		if (!what) {
			return SendPrivate(m, char.name + ' is' + loc.look());
		}

		const item = loc.get(what);
		if (!item) {
			return SendPrivate(m, 'Item not found');
		}

		return ReplyBlock(m, item.getDetails(), {
			components: [WorldItemActions(item)]
		});

	}
})