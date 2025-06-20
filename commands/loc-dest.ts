import { CommandData, NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('locdesc', 'Set location description')
		.addStringOption(StrOpt('desc', 'Description of location').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const desc = m.options.getString('desc', true);

		const resp = await rpg.world.setDesc(char, desc);// m.attachments?.first()?.proxyURL);
		if (resp) return SendPrivate(m, resp);


	}
})