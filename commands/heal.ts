import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { PickCharButtons } from "rpg/components";
import { SendBlock, SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('heal', 'Attempt to heal character. (Talent only)')
		.addStringOption(StrOpt('who', 'Character to heal.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const who = m.options.getString('who');
		if (who == char.id || who == char.name) {
			return SendPrivate(m, 'You cannot heal yourself.');
		}

		if (!who) {

			const aliveChars = await rpg.game.getAliveChars(char.at, char.id);
			if (aliveChars?.length) {
				// res options?
				return SendPrivate(m, `Heal which character?`, {

					components: PickCharButtons('heal', aliveChars, "who")
				});
			} else {
				return SendPrivate(m, 'There see no living characters here.');
			}

		}

		const t = await rpg.loadChar(who);
		if (!t) {
			return SendPrivate(m, `${who} not found`);
		}

		await rpg.game.exec('heal', char, t)

		await SendBlock(m, char.flushLog());

	}
})