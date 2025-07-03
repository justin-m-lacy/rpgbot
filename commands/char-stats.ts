import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { type InteractionReplyOptions } from "discord.js";
import { getHistory } from "rpg/char/events";
import { OtherCharActions, OwnCharActions } from "rpg/components";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	alias: 'charstats',
	data: CommandData('stats', 'View a character\'s stats')
		.addStringOption(StrOpt('who', 'Character whose stats to view')),
	async exec(m: ChatCommand, rpg: Rpg) {

		let char;

		const who = m.options.getString('who');

		const opts: InteractionReplyOptions = {};

		if (!who) {

			char = await rpg.userCharOrErr(m, m.user);
			if (!char) return;

			opts.components = [OwnCharActions()];

		} else {

			char = await rpg.loadChar(who);
			if (!char) return SendPrivate(m, who + ' not found on server. :O');

			opts.components = [OtherCharActions(rpg.game, char)];

		}

		await ReplyBlock(m, getHistory(char), opts);

	}
})