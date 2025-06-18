import { NewCommand, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('move', 'Move in given direction')
		.addStringOption(StrOpt('dir', 'Direction to move').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const dir = m.options.getString('dir', true);

		await SendBlock(m, await rpg.game.move(char, dir));
		rpg.checkLevel(m, char);

	}
} as Command<Rpg>