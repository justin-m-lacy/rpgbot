import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { rollWeap } from "rpg/trade";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('rollweap', 'Roll for new weapon'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (char) {
			await SendBlock(m, rollWeap(char));
		}

	}
})