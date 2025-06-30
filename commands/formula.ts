import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { PermissionFlagsBits } from "discord.js";
import { Formula } from "formulic";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('formula', 'Test formula')
		.addStringOption(StrOpt('formula', 'Formula to compute').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async exec(m: ChatCommand, rpg: Rpg) {

		if (!rpg.context.isOwner(m.user)) return SendPrivate(m, 'You do not have permission to do that.');
		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const str = m.options.getString('formula', true);
		const f = Formula.TryParse(str);
		if (!f) return SendPrivate(m, 'Incantation malformed.');

		const res = f.eval(char);
		return SendPrivate(m, 'result: ' + res);

	}
})