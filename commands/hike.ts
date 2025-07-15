import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrChoices } from "@/bot/command";
import { SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { toDirection } from "rpg/world/loc";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('hike', 'Attempt to hike in a given direction')
		.addStringOption(StrChoices('dir', 'Direction to hike', [
			{ name: 'north', value: 'n' },
			{ name: 'south', value: 's' },
			{ name: 'east', value: 'e' },
			{ name: 'west', value: 'w' }]).setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const dir = m.options.getString('dir', true);

		return SendPrivate(m, await rpg.game.exec('hike', char, toDirection(dir)));

	}
})