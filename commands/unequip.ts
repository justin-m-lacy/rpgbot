import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrChoices } from "@/bot/command";
import { SendPrivate } from "rpg/display/display";
import { GetSlots } from "rpg/items/wearable";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('unequip', 'Unequip wearable slot', [
		StrChoices('slot', 'Slot to unequip',
			GetSlots().map(v => ({ name: v, value: v }))
		).setRequired(true)
	]),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user)
		if (!char) return;

		const slot = m.options.getString('slot', true);

		return SendPrivate(m, await rpg.game.exec('unequip', char, slot));

	}
})