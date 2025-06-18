import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { rollArmor } from "rpg/trade";

export default {
	cls: Rpg,
	data: NewCommand('rollarmor', 'Roll for new armor')
		.addStringOption(StrOpt('slot', 'Slot to roll new armor for')),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (char) {
			const slot = m.options.getString('slot');
			await SendBlock(m, rollArmor(char, slot));
		}

	}
} as CommandData<Rpg>