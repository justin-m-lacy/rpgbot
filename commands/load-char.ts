import { NewCommand, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { EchoChar } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('setchar', 'Set active character')
		.addStringOption(StrOpt('name', 'Character name')),
	async exec(m: ChatAction, rpg: Rpg) {

		const charname = m.options.getString('name') ?? m.user.username;

		const char = await rpg.loadChar(charname);
		if (!char) return m.reply(charname + ' not found on server. D:');

		let prefix;

		if (char.owner !== m.user.id) {
			prefix = 'This is NOT your character.\n';
		} else {

			await rpg.setUserChar(m.user, char);
			prefix = 'Active character set.\n';
		}

		return EchoChar(m, char, prefix);

	}
} as Command<Rpg>