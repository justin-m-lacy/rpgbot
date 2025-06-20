import { CommandData, NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('unequip', 'Unequip wearable slot', [
		StrOpt('slot', 'Slot to unequip').setRequired(true)
	]),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const slot = m.options.getString('slot', true);

		return m.reply(rpg.game.unequip(char, slot));

	}
})