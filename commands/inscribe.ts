import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { InventoryButtons } from "rpg/components";
import { SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('inscribe', 'Inscribe inventory item with a message')
		.addStringOption(StrOpt('what', 'Item to inscribe').setRequired(true))
		.addStringOption(StrOpt('text', 'Text to inscribe')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user)
		if (!char) return;

		const what = m.options.getString('what', true);
		const text = m.options.getString('text');

		if (!what) {
			return SendPrivate(m, 'Inscribe which inventory item?', {
				components: InventoryButtons('inscribe', char.inv, 'what', {
					text: text || undefined
				})
			});
		}

		return SendPrivate(m, await rpg.game.action('inscribe', char, what, text || ''));


	}
})