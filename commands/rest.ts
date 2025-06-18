import { NewCommand, type ChatAction, type CommandData } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('rest', 'Attempt to rest'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (char) return m.reply(await rpg.game.rest(char));

	}
} as CommandData<Rpg>