import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand } from "@/bot/command";
import { SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { Coord } from "rpg/world/coord";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('sethome', 'Set current location as home'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		if (char.home) {
			char.home.setTo(char.at);
		} else char.home = new Coord(char.at.x, char.at.y);

		if (char) return SendPrivate(m, `${char.name} Home set.`);

	}
})