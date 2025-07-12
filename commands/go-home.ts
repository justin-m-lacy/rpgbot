import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand } from "@/bot/command";
import { SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('gohome', 'Return home.'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		return SendPrivate(m, await rpg.game.exec('home', char));


	}
})