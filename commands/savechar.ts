import { CommandData, NewCommand, type ChatAction } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('savechar', 'Force save current character'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await rpg.saveChar(char, true);
		return m.reply(char.name + ' saved.');

	}
})