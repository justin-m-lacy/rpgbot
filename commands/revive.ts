import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { PickCharButtons } from "rpg/components";
import { SendBlock, SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('revive', 'Attempt to revive character.')
		.addStringOption(StrOpt('who', 'Character to revive.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const who = m.options.getString('who');

		if (!who) {

			const loc = await rpg.world.getLoc(char.at);
			if (!char.isAlive()) {
				// get char list at location.

				const shrine = loc?.getFeature('shrine');
				if (shrine) {
					await rpg.game.action('useloc', char, 'shrine');
					return SendPrivate(m, char.flushLog());
				} else {
					return SendPrivate(m, `You may only revive yourself at a shrine.`);
				}
			} else {

				const deadChars = await rpg.game.getDeadChars(char.at, char.id);
				if (deadChars?.length) {
					// res options?
					return SendPrivate(m, `Revive which character?`, {

						components: PickCharButtons('revive', deadChars, "who")
					});
				} else {
					return SendPrivate(m, `You do not see any dead characters here.`);
				}

			}

		}
		const t = await rpg.loadChar(who);
		if (!t) {
			return SendPrivate(m, `${who} not found`);
		}

		await rpg.game.action('revive', char, t)

		await SendBlock(m, char.flushLog());

	}
})