import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { toDirection } from "rpg/world/loc";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('hike', 'Attempt to hike in a given direction')
		.addStringOption(StrOpt('dir', 'Direction to hike').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const dir = m.options.getString('dir', true);

		await ReplyBlock(m, await rpg.game.hike(char, toDirection(dir)));

	}
})