import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('rolldmg', 'Test weapon damage'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (char) {
			return SendPrivate(m, 'Weapon roll for ' + char.name + ': ' + char.testDmg());
		}

	}
})