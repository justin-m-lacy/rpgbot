import { NewCommand, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { PotsList } from "rpg/builders/itemgen";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('potlist', 'Get list of available potions')
		.addStringOption(StrOpt('level', 'Level of potions to list').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		let level: string | number = m.options.getString('level', true);

		if (!level) return m.reply('List potions for which level?');
		if (typeof level === 'string') level = parseInt(level);
		return m.reply(PotsList(level));


	}
} as Command<Rpg>