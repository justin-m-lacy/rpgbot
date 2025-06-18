import { NewCommand, type ChatAction, type Command } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('guildleave', 'Leave current guild.'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await SendBlock(m, await rpg.game.leaveGuild(char));

	}
} as Command<Rpg>