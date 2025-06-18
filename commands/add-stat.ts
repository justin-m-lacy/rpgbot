import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('addstat', 'Assign stat point', [
		StrOpt('stat', 'Stat to increase').setRequired(true)
	]),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const stat = m.options.getString('stat', true);
		const res = char.addStat(stat);

		if (typeof (res) === 'string') return m.reply(res);


	}
} as CommandData<Rpg>