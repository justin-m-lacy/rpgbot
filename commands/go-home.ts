import { NewCommand, type ChatAction } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('gohome', 'Return home.'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		return m.reply(rpg.game.goHome(char));


	}
}