import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { PickCharButtons } from "rpg/actions";
import { Char } from "rpg/char/char";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('steal', 'Attempt to steal from character')
		.addStringOption(StrOpt('who', 'Character to steal from'))
		.addStringOption(StrOpt('what', 'What to steal')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const src = await rpg.userCharOrErr(m, m.user);
		if (!src) return;

		const who = m.options.getString('who', true);
		if (!who) {

			return SendPrivate(m, 'Steal from whom?', {
				components: PickCharButtons('steal',
					(await rpg.world.getOrGen(src.loc)).npcs.filter((v): v is Char => v instanceof Char)
				)
			})

		}

		const what = m.options.getString('what');

		const dest = await rpg.loadChar(who);
		if (!dest) return SendPrivate(m, `'${who}' not seen here.`);

		const result = await rpg.game.steal(src, dest, what);
		await ReplyBlock(m, result);

	}
})