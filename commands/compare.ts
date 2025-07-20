import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { CustomButton } from "@/bot/command-map";
import { InventoryButtons } from "rpg/components";
import { ReplyBlock, SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { ToActionRows } from '../rpg/components';

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('compare', 'Compare item in inventory to current worn item')
		.addStringOption(StrOpt('item', 'Item to equip').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const what = m.options.getString('what', true);
		if (!what) return SendPrivate(m, 'Compare what item?', {
			components: InventoryButtons('compare', char.inv, 'item')
		});

		return ReplyBlock(m, rpg.game.compare(char, what), {
			components: ToActionRows(
				[CustomButton({ customId: 'compare', label: `Equip ${what}` }, {
					item: what
				})])
		});

	}
})