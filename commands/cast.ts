import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	alias: 'cast',
	data: CommandData('cast', 'Cast a spell')
		.addStringOption(StrOpt('spell', 'Spell to cast')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const spellName = m.options.getString('spell');
		if (!spellName) {
			return SendPrivate(m, 'Cast what spell?');
		}

		const spell = char.spelllist.find(spellName);
		if (spell == null) {
			return SendPrivate(m, `You do not know the spell, ${spellName}`);
		}



	}
})