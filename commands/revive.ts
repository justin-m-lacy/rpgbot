import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('revive', 'Attempt to revive character.')
		.addStringOption(StrOpt('who', 'Character to revive.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const who = m.options.getString('who');

		if (!who && char.isAlive()) {

			// get char list at location.
			const loc = await rpg.world.getLoc(char.at);
			const shrine = loc?.getFeature('shrine');
			if (shrine) {
				await rpg.game.action('useloc', char, 'shrine');
				return SendPrivate(m, char.flushLog());
			} else {
				return SendPrivate(m, `You may only revive yourself at a shrine.`);
			}

		}

		const t = who ? await rpg.loadChar(who) : char;
		if (!t) return;

		await SendBlock(m, await rpg.game.action('revive', char, t));

	}
})