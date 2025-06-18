import { NewCommand, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('explored', 'Get number of locations discovered by character.'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		return SendBlock(m, await rpg.world.explored(char));


	}
} as CommandData<Rpg>