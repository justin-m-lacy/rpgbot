import { CommandData, NewCommand, type ChatAction } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('rest', 'Attempt to rest'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (char) return m.reply(await rpg.game.rest(char));

	}
})