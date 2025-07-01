import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { CustomButton } from "@/bot/command-map";
import { SendPrivate } from "@/utils/display";
import { ButtonStyle } from "discord.js";
import { ToActionRows } from "rpg/actions";
import { StatIds } from "rpg/char/stats";
import { Rpg } from "rpg/rpg";
import { ChatCommand } from '../src/bot/cmd-wrapper';

export default NewCommand<Rpg>(
	{
		data: CommandData('addstat', 'Assign stat point', [
			StrOpt('stat', 'Stat to increase')
		]),
		cls: Rpg,
		async exec(m: ChatCommand, rpg: Rpg) {

			const char = await rpg.userCharOrErr(m, m.user);
			if (!char) return;

			const stat = m.options.getString('stat');

			if (!stat) {

				// prompt stat to increase.
				return SendPrivate(m, 'Increase which stat?', {
					components:

						ToActionRows(

							StatIds.map(stat =>
								CustomButton({
									customId: 'addstat',
									label: stat,
									style: ButtonStyle.Primary

								}, {
									stat: stat
								})
							)

						)

				});

			}

			const res = char.addStat(stat);
			if (res) {
				SendPrivate(m, `${stat} increased.`);
			} else {
				SendPrivate(m, char.getLog());
			}

		}
	});