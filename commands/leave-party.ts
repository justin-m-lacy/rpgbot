import { NewCommand, type ChatAction } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('leaveparty', 'Leave current party.'),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await SendBlock(m, rpg.game.leaveParty(char));
	}
}