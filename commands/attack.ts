import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { PickNpcButtons } from "rpg/actions";
import { SendBlock } from "rpg/display/display";
import { Monster } from "rpg/monster/monster";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	alias: 'a',
	data: CommandData('attack', 'Attack character or monster')
		.addStringOption(StrOpt('who', 'Who or what to attack')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const src = await rpg.userCharOrErr(m, m.user);
		if (!src) return;

		const who = m.options.getString('who');
		if (!who) {

			const loc = await rpg.world.getOrGen(src.loc);
			return SendPrivate(m, 'Attack who?', {
				components: PickNpcButtons('attack', loc.npcs)
			});

		}

		let targ = await rpg.world.getNpc(src, who);
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