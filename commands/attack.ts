import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { PickTargButtons } from "rpg/components";
import { SendBlock, SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	alias: 'a',
	data: CommandData('attack', 'Attack character or monster')
		.addStringOption(StrOpt('who', 'Who or what to attack')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		let who: string | number | null = m.options.getString('who');
		if (!who) {

			const loc = await rpg.world.getOrGen(char.at);

			if (loc.npcs.length === 0) {
				return SendPrivate(m, 'Attack who?');
			} else if (loc.npcs.length > 1) {

				return SendPrivate(m, 'Attack who?', {
					components: PickTargButtons('attack', loc)
				});
			}
			who = 1;

		}

		const targ = await rpg.getActor(char, who);
		if (!targ) {
			return SendPrivate(m, `'${who}' not found.`);
		}

		return SendBlock(m, await rpg.game.exec('attack', char, targ));
	}

});