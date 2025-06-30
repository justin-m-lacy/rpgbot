import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { EchoChar } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('setchar', 'Set active character')
		.addStringOption(StrOpt('name', 'Character name')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const charname = m.options.getString('name') ?? m.user.username;

		const char = await rpg.loadChar(charname);
		if (!char) return SendPrivate(m, charname + ' not found on server. D:');

		let prefix;

		if (char.owner !== m.user.id) {
			prefix = 'This is NOT your character.\n';
		} else {

			await rpg.setUserChar(m.user, char);
			prefix = 'Active character set.\n';
		}

		return EchoChar(m, char, prefix);

	}
})