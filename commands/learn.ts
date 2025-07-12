import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "rpg/display/display";
import { GetSpell } from "rpg/parsers/spells";
import { Rpg } from "rpg/rpg";

/**
 * Learn new spell.
 */
export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('learn', 'Learn spell from a spellbook.')
		.addStringOption(StrOpt('spell', 'Spell to learn.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const spellName = m.options.getString('spell');
		if (!spellName) {
			return SendPrivate(m, 'Learn what spell?');
		}

		const spell = GetSpell(spellName);
		if (!spell) {
			return SendPrivate(m, `'${spellName}' is not a spell.`);
		}

		if (char.spelllist.has(spell.id)) {
			return SendPrivate(m, `You already know spell ${spellName}`);
		}

		char.spelllist.add(spell);

		return SendPrivate(m, `${char.name} has learned spell ${spell.name}`);

	}
})