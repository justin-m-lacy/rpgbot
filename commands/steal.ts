import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { PickCharButtons } from "rpg/components";
import { ReplyBlock, SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('steal', 'Attempt to steal from character')
		.addStringOption(StrOpt('who', 'Character to steal from'))
		.addStringOption(StrOpt('what', 'What to steal')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const src = await rpg.myCharOrErr(m, m.user);
		if (!src) return;

		const who = m.options.getString('who', true);
		if (!who) {

			return SendPrivate(m, 'Steal from whom?', {
				components: PickCharButtons('steal',
					(await rpg.world.getOrGen(src.at)).chars
				)
			});

		}

		const dest = await rpg.loadChar(who);
		if (!dest?.at.equals(src.at)) {
			return SendPrivate(m, `${src.name} does not see '${who}' here.`);
		}

		const what = m.options.getString('what');

		const result = await rpg.game.exec('steal', src, dest, what);
		await ReplyBlock(m, result);

	}
})