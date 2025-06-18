import { NewCommand, type ChatAction, type Command } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('savechar', 'Force save current character'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await rpg.saveChar(char, true);
		return m.reply(char.name + ' saved.');

	}
} as Command<Rpg>