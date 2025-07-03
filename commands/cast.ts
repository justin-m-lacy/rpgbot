import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { ActTarget } from "rpg/combat/targets";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	alias: 'cast',
	data: CommandData('cast', 'Cast a spell')
		.addStringOption(StrOpt('spell', 'Spell to cast'))
		.addStringOption(StrOpt('at', 'What to cast at')),
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

		const who = m.options.getString('at');
		if (!who) {
			if ((spell.target & (ActTarget.all | ActTarget.none | ActTarget.self)) === 0) {
				return SendPrivate(m, `Cast ${spell.name} at what?`,)
			}
		}
		const targ = who ? await rpg.getActor(char, who) : undefined;
		if (who && !targ) {
			return SendPrivate(m, `'${who}' not found.`);
		}


	}
})