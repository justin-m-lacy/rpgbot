import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type InteractionReplyOptions } from "discord.js";
import { getHistory } from "rpg/char/events";
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


			const actions = new ActionRowBuilder().addComponents(

				new ButtonBuilder().setCustomId('inventory').setLabel('Inventory').setStyle(ButtonStyle.Secondary),
				new ButtonBuilder().setCustomId('equip').setLabel('Equipped').setStyle(ButtonStyle.Secondary)

			);
			opts.components = [actions.toJSON()];

		} else {

			char = await rpg.loadChar(who);
			if (!char) return SendPrivate(m, who + ' not found on server. :O');

		}

		await ReplyBlock(m, getHistory(char), opts);

	}
})