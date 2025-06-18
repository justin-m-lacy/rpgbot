import { NewCommand, type ChatAction, type Command } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('explored', 'Get number of locations discovered by character.'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		return SendBlock(m, await rpg.world.explored(char));


	}
} as Command<Rpg>