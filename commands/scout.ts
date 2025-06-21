import { CommandData, NewCommand } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('scout', 'Scout location'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await SendBlock(m, rpg.game.scout(char));

	}
})