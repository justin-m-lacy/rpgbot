import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('equip', 'Equip wearable item')
		.addStringOption(StrOpt('item', 'Item to equip')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user)
		if (!char) return;

		const what = m.options.getString('item');

		if (!what) {
			return ReplyBlock(m, `${char.name} equip:\n${char.listEquip()}`);
		}

		return ReplyBlock(m, await rpg.game.exec('equip', char, what));
	}
})