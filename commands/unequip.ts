import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('unequip', 'Unequip wearable slot')
		.addStringOption(StrOpt('slot', 'Slot to unequip').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const slot = m.options.getString('slot', true);

		return m.reply(rpg.game.unequip(char, slot));

	}
} as CommandData<Rpg>