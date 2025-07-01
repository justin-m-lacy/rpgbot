import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('equip', 'Equip wearable item')
		.addStringOption(StrOpt('what', 'Item to equip').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const what = m.options.getString('what', true);

		if (!what) return ReplyBlock(m, `${char.name} equip:\n${char.listEquip()}`);

		return ReplyBlock(m, rpg.game.equip(char, what));
	}
})