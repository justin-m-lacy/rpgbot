import { NewCommand, type ChatAction, type CommandData } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('rolldmg', 'Test weapon damage'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (char) {
			return m.reply('Weapon roll for ' + char.name + ': ' + char.testDmg());
		}

	}
} as CommandData<Rpg>