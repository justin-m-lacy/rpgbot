import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { PickItemButtons } from "rpg/components";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('eat', 'Eat food from inventory')
		.addStringOption(StrOpt('what', 'object to eat')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const what = m.options.getString('what', true);
		if (!what) {
			return SendPrivate(m, 'Eat which item?', {
				components: PickItemButtons('eat', char.inv, 'what')
			})
		}

		return SendPrivate(m, await rpg.game.action('eat', char, what));

	}

});