import { NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { SendBlock, SendEmbed } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('view', 'View location or feature at location')
		.addStringOption(StrOpt('what', 'Feature to view.')),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const what = m.options.getString('what');

		const info = await rpg.world.view(char, what);

		if (typeof (info) === 'string') await SendBlock(m, info);
		else SendEmbed(m, info[0], info[1]);


	}
}