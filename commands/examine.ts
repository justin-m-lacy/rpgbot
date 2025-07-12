import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { ReplyEmbed } from "@/embeds";
import { InventoryButtons } from "rpg/components";
import { SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('ex', 'Examine item at location.')
		.addStringOption(StrOpt('item', 'Item on ground.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;
		const item = m.options.getString('item');
		if (!item) {

			const loc = await rpg.world.getLoc(char.at);
			return SendPrivate(m, `Examine what item?`, {
				components: loc?.inv ? InventoryButtons('ex', loc.inv, 'item') : undefined
			});

		}

		const info = await rpg.world.examine(char, item)
		if (info) {
			return ReplyEmbed(m, info[0], info[1]);
		}

		const loc = await rpg.world.getLoc(char.at);
		return SendPrivate(m, `Item ${item} not found. Examine what?`, {
			components: loc?.inv ? InventoryButtons('ex', loc.inv, 'item') : undefined
		});
	}
})