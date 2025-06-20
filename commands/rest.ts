import { CommandData, NewCommand, type ChatAction } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('rest', 'Attempt to rest'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (char) return SendPrivate(m, await rpg.game.rest(char));

	}
})