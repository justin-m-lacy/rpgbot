import { NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { EchoChar } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('viewchar', 'View character or self')
		.addStringOption(StrOpt('who', 'Character to view')),
	async exec(m: ChatAction, rpg: Rpg) {

		let char;

		const charname = m.options.getString('who');

		if (!charname) {
			char = await rpg.userCharOrErr(m, m.user);
			if (!char) return;
		} else {
			char = await rpg.loadChar(charname);
			if (!char) return m.reply(charname + ' not found on server. D:');
		}
		return EchoChar(m, char);

	}
}