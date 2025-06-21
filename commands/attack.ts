import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendPrivate } from "@/utils/display";
import { SendBlock } from "rpg/display/display";
import { Monster } from "rpg/monster/monster";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('attack', 'Attack character or monster')
		.addStringOption(StrOpt('who', 'Who or what to attack')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const who = m.options.getString('who');

		const src = await rpg.userCharOrErr(m, m.user);
		if (!src) return;

		let targ = await rpg.world.getNpc(src, who ?? 1);
		let res;

		if (targ) {
			res = await (targ instanceof Monster ?
				rpg.game.attackNpc(src, targ)
				: rpg.game.attack(src, targ)
			);
		} else if (typeof who === 'string') {

			targ = await rpg.loadChar(who);
			if (!targ) return SendPrivate(m, `'${who}' not found.`);

			res = await rpg.game.attack(src, targ);

		} else {
			return SendPrivate(m, `'${who}' not found.`);
		}

		await SendBlock(m, res);
	}
});