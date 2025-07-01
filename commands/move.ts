import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt, type Command } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";


export function GetCommands(): Command[] {
	return [CmdMove, CmdNorth, CmdSouth, CmdEast, CmdWest];
}

const CmdMove = NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('move', 'Move in given direction')
		.addStringOption(StrOpt('dir', 'Direction to move')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const dir = m.options.getString('dir', true);
		if (!dir) {

			return SendPrivate(m, 'Move in what direction?', {
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(

						new ButtonBuilder({
							customId: 'north',
							label: 'North',
							style: ButtonStyle.Secondary
						}),
						new ButtonBuilder({
							customId: 'south',
							label: 'South',
							style: ButtonStyle.Secondary
						}),
						new ButtonBuilder({
							customId: 'east',
							label: 'East',
							style: ButtonStyle.Secondary
						}),
						new ButtonBuilder({
							customId: 'west',
							label: 'West',
							style: ButtonStyle.Secondary
						})

					)
				]
			})

		}

		await ReplyBlock(m, await rpg.game.move(char, dir));

	}
});

const CmdNorth = NewCommand<Rpg>({
	cls: Rpg,
	alias: 'n',
	data: CommandData('north', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await ReplyBlock(m, await rpg.game.move(char, 'n'));

	}
});

const CmdSouth = NewCommand<Rpg>({
	cls: Rpg,
	alias: 's',
	data: CommandData('south', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await ReplyBlock(m, await rpg.game.move(char, 's'));

	}
});

const CmdEast = NewCommand<Rpg>({
	cls: Rpg,
	alias: 'e',
	data: CommandData('east', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await ReplyBlock(m, await rpg.game.move(char, 'e'));

	}
})


const CmdWest = NewCommand<Rpg>({
	cls: Rpg,
	alias: 'w',
	data: CommandData('west', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await ReplyBlock(m, await rpg.game.move(char, 'w'));

	}
});