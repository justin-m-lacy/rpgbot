import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { PotsList } from "rpg/parsers/potions";
import { Rpg } from "rpg/rpg";
import { SendPrivate } from '../src/utils/display';

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('potlist', 'Get list of available potions')
		.addStringOption(StrOpt('level', 'Level of potions to list').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		let level: string | number = m.options.getString('level', true);

		if (!level) return SendPrivate(m, 'List potions for which level?');
		if (typeof level === 'string') level = parseInt(level);
		return SendPrivate(m, PotsList(level));


	}
})