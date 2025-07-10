import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand } from "@/bot/command";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('hide', 'Attempt to move steathily. Combat will end the effect.'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		await ReplyBlock(m, await rpg.game.action('hide', char));

	}
})