import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { TargetFlags } from "rpg/combat/targets";
import { GetSpell } from "rpg/parsers/spells";
import { Rpg } from "rpg/rpg";
import { SendBlock } from '../rpg/display/display';

export default NewCommand<Rpg>({
	cls: Rpg,
	alias: 'cast',
	data: CommandData('cast', 'Cast a spell')
		.addStringOption(StrOpt('spell', 'Spell to cast'))
		.addStringOption(StrOpt('at', 'What to cast at')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const spellName = m.options.getString('spell');
		if (!spellName) {
			return SendPrivate(m, 'Cast what spell?');
		}

		const spell = GetSpell(spellName);
		//char.spelllist.find(spellName);
		if (spell == null) {
			return SendPrivate(m, `You do not know the spell, ${spellName}`);
		}

		const at = m.options.getString('at');
		if (!at) {
			if ((spell.target & (TargetFlags.all | TargetFlags.none | TargetFlags.self)) === 0) {
				return SendPrivate(m, `Cast ${spell.name} at what?`,)
			}
		}
		const targ = spell.target === TargetFlags.self ? char :
			(at ? await rpg.getActor(char, at) : undefined);
		if (at && !targ) {
			return SendPrivate(m, `'${at}' not found.`);
		}

		await rpg.game.action('cast', char, spell, targ);

		SendBlock(m, char.flushLog());

	}
})