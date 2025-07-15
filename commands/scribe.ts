import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock, SendPrivate } from "rpg/display/display";
import { GetSpell } from "rpg/parsers/spells";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('scribe', 'Scribe a spell scroll.')
		.addStringOption(StrOpt('spell', 'Spell to scribe').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const spellId = m.options.getString('spell', true);

		const char = await rpg.myCharOrErr(m, m.user)
		if (!char) return;

		if (!spellId) {
			return SendPrivate(m, 'Scribe which spell?');
		}
		const spell = GetSpell(spellId);
		if (!spell) {
			return SendPrivate(m, `There is no spell called ${spellId}`);
		}
		if (!char.spelllist.has(spell.id)) {
			return SendPrivate(m, `${char.name} does not know the spell ${spell.name}`);
		}

		return SendBlock(m, await rpg.game.exec('scribe', char, spell));

	}
})