import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";
import { ChatCommand } from '../src/bot/cmd-wrapper';

export default NewCommand<Rpg>(
	{
		data: CommandData('addstat', 'Assign stat point', [
			StrOpt('stat', 'Stat to increase').setRequired(true)
		]),
		cls: Rpg,
		async exec(m: ChatCommand, rpg: Rpg) {

			const char = await rpg.userCharOrErr(m, m.user);
			if (!char) return;

			const stat = m.options.getString('stat', true);
			const res = char.addStat(stat);

			if (res) {
				SendPrivate(m, `${stat} increased.`);
			} else {
				SendPrivate(m, char.getLog());
			}

		}
	});