import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Monster } from "rpg/monster/monster";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('ex', 'Attack character or monster')
		.addStringOption(StrOpt('who', 'Who or what to attack')),
	async exec(m: ChatAction, rpg: Rpg) {

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
			if (!targ) return m.reply(`'${who}' not found.`);

			res = await rpg.game.attack(src, targ);

		} else {
			return m.reply(`'${who}' not found.`);
		}

		await SendBlock(m, res);
	}
} as CommandData<Rpg>