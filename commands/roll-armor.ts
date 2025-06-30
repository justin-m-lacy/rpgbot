import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { rollArmor } from "rpg/trade";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('rollarmor', 'Roll for new armor')
		.addStringOption(StrOpt('slot', 'Slot to roll new armor for')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (char) {
			const slot = m.options.getString('slot');
			await SendBlock(m, rollArmor(char, slot));
		}

	}
})