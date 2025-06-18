import { NewCommand, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { rollWeap } from "rpg/trade";

export default {
	data: NewCommand('rollweap', 'Roll for new weapon'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (char) {
			await SendBlock(m, rollWeap(char));
		}

	}
} as CommandData<Rpg>