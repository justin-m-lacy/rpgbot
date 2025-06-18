import { NewCommand, type ChatAction, type Command } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('sethome', 'Set current location as home'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		return m.reply(rpg.world.setHome(char));


	}
} as Command<Rpg>