import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('where', 'Locate character.')
		.addStringOption(StrOpt('who', 'Character to track.').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const who = m.options.getString('who', true);

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const t = await rpg.loadChar(who);
		if (!t) return;
		return SendPrivate(m, t.name + ' is at ' + t.at.toString());


	}
})