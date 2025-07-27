import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { CustomButton } from "@/bot/command-map";
import { ButtonStyle } from "discord.js";
import { StatIds } from "rpg/char/stat";
import { ToActionRows } from "rpg/components";
import { SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { ChatCommand } from '../src/bot/cmd-wrapper';

export default NewCommand<Rpg>(
	{
		data: CommandData('addstat', 'Assign stat point', [
			StrOpt('stat', 'Stat to increase')
		]),
		cls: Rpg,
		async exec(m: ChatCommand, rpg: Rpg) {

			const char = await rpg.myCharOrErr(m, m.user);
			if (!char) return;

			const stat = m.options.getString('stat');

			if (!stat) {

				// prompt stat to increase.
				return SendPrivate(m, 'Increase which stat?', {
					components:

						ToActionRows(

							StatIds.map(s =>
								CustomButton({
									customId: 'addstat',
									label: s,
									style: ButtonStyle.Primary
								}, {
									stat: s
								})
							)

						)

				});

			}

			if (char.addStat(stat)) {
				const val = char.stats[stat]!;
				return SendPrivate(m, `${stat} increased. (` +
					((val.value == val.base) ? (val.value) : (`${val.value}/${val.base}`)) + ')');
			} else {
				return SendPrivate(m, char.flushLog());
			}

		}
	});