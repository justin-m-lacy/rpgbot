import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { TargetFlags } from "rpg/combat/targets";
import { OptionButtons, PickTargButtons } from "rpg/components";
import { SendPrivate } from "rpg/display/display";
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
		const at = m.options.getString('at');

		if (!spellName) {
			return SendPrivate(m, 'Cast what spell?', {
				components: OptionButtons('cast', char.spelllist.items, "spell", {
					at
				})
			});
		}

		const spell = GetSpell(spellName);

		//char.spelllist.find(spellName);
		if (spell == null) {
			return SendPrivate(m, `You do not know the spell ${spellName}`);
		}


		if (!at) {
			if ((spell.target & (TargetFlags.self | TargetFlags.mult | TargetFlags.loc)) === 0) {

				const loc = await rpg.world.getLoc(char.at);
				return SendPrivate(m, `Cast ${spell.name} at what?`,
					{
						components: loc ? PickTargButtons('cast', loc, 'at') : undefined
					}
				)
			}
		}
		const targ = spell.target === TargetFlags.self ? char :
			(at ? await rpg.getActor(char, at) : undefined);
		if (at && !targ) {
			return SendPrivate(m, `'${at}' not found.`);
		}

		await rpg.game.exec('cast', char, spell, targ);

		SendBlock(m, char.flushLog());

	}
})