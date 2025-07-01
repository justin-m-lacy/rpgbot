import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import type { InteractionReplyOptions } from "discord.js";
import { OtherCharActions, OwnCharActions } from "rpg/actions";
import { EchoChar } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { ChatCommand } from '../src/bot/cmd-wrapper';

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('viewchar', 'View character or self')
		.addStringOption(StrOpt('who', 'Character to view')),
	async exec(m: ChatCommand, rpg: Rpg) {

		let char;

		const charname = m.options.getString('who');

		const opts: InteractionReplyOptions = {};


		if (!charname) {
			char = await rpg.userCharOrErr(m, m.user);
			if (!char) return;
			opts.components = [OwnCharActions()]
		} else {
			char = await rpg.loadChar(charname);
			if (!char) return SendPrivate(m, charname + ' not found on server.');
			opts.components = [OtherCharActions(rpg.game, char)];
		}
		return EchoChar(m, char, opts);

	}
})