import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { toDirection } from "rpg/world/loc";

export default {
	data: NewCommand('hike', 'Attempt to hike in a given direction')
		.addStringOption(StrOpt('dir', 'Direction to hike').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const dir = m.options.getString('dir', true);

		await SendBlock(m, await rpg.game.hike(char, toDirection(dir)));
		rpg.checkLevel(m, char);

	}
} as CommandData<Rpg>