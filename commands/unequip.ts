import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('unequip', 'Unequip wearable slot', [
		StrOpt('slot', 'Slot to unequip').setRequired(true)
	]),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const slot = m.options.getString('slot', true);

		return SendPrivate(m, rpg.game.unequip(char, slot));

	}
})