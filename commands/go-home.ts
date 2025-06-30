import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('gohome', 'Return home.'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		return m.reply(rpg.game.goHome(char));


	}
})