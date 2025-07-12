import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { CustomButton } from "@/bot/command-map";
import { ActionRowBuilder, type ButtonBuilder, ButtonStyle } from "discord.js";
import { ToActionRows, WorldItemActions } from "rpg/components";
import { ReplyBlock, SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { type DirVal, type Loc, ToDirStr } from "rpg/world/loc";

export const MoveButtons = (loc: Loc) => {

	const btns: ButtonBuilder[] = [];
	let k: DirVal;
	for (k in loc.exits) {

		const label = ToDirStr(k);
		if (!label || label.length == 0) {
			console.error(`bad dir: ${k}`);
			continue;
		}
		btns.push(CustomButton({

			customId: 'move',
			label: ToDirStr(k)

		}, {
			dir: k
		}));

	}

	return btns.length > 0 ? ToActionRows(btns) : [];

}

export const WorldLocActions = (loc: Loc) => {

	const btns: ButtonBuilder[] = [];

	if (loc.items.length > 0) {

		btns.push(CustomButton({
			customId: 'take',
			label: 'Take',
			style: ButtonStyle.Secondary
		}));

	}
	if (loc.npcs.length > 0) {

		btns.push(CustomButton({
			customId: 'attack',
			label: 'Attack',
			style: ButtonStyle.Danger
		}));

	}

	const rows = MoveButtons(loc);
	if (btns.length > 0) {
		rows.push(
			new ActionRowBuilder<ButtonBuilder>().addComponents(...btns)
		);
	}

	if (rows.length == 0) {
		console.log(`no button rows...`);
	}
	return rows;

}

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('look', 'Look at item on ground.')
		.addStringOption(StrOpt('what', 'Item on ground to look at.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const what = m.options.getString('what');

		const loc = await rpg.world.getOrGen(char.at);
		//loc.embed
		if (!what) {
			return SendPrivate(m, loc.look(char), {
				components: WorldLocActions(loc)
			});
		}

		const item = loc.get(what);
		if (!item) {
			return SendPrivate(m, `Item ${what} not found`);
		}

		return ReplyBlock(m, item.getDetails(char), {
			components: [WorldItemActions(item)]
		});

	}
})