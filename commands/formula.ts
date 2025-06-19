import { NewCommand, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { PermissionFlagsBits } from "discord.js";
import { Formula } from "formulic";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('formula', 'Test formula')
		.addStringOption(StrOpt('formula', 'Formula to compute').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async exec(m: ChatAction, rpg: Rpg) {

		if (!rpg.context.isOwner(m.user)) return m.reply('You do not have permission to do that.');
		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const str = m.options.getString('formula', true);
		const f = Formula.TryParse(str);
		if (!f) return m.reply('Incantation malformed.');

		const res = f.eval(char);
		return m.reply('result: ' + res);

	}
} as Command<Rpg>