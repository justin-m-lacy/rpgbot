import { CommandData, NewCommand, StrOpt, type Command } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";


export function GetCommands(): Command[] {
	return [CmdMove, CmdNorth, CmdSouth, CmdEast, CmdWest];
}

const CmdMove = NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('move', 'Move in given direction')
		.addStringOption(StrOpt('dir', 'Direction to move').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		const dir = m.options.getString('dir', true);

		await SendBlock(m, await rpg.game.move(char, dir));
		rpg.checkLevel(m, char);

	}
});

const CmdNorth = NewCommand<Rpg>({
	cls: Rpg,
	alias: 'n',
	data: CommandData('north', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await SendBlock(m, await rpg.game.move(char, 'n'));
		rpg.checkLevel(m, char);

	}
});

const CmdSouth = NewCommand<Rpg>({
	cls: Rpg,
	alias: 's',
	data: CommandData('south', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await SendBlock(m, await rpg.game.move(char, 's'));
		rpg.checkLevel(m, char);

	}
});

const CmdEast = NewCommand<Rpg>({
	cls: Rpg,
	alias: 'e',
	data: CommandData('east', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await SendBlock(m, await rpg.game.move(char, 'e'));
		rpg.checkLevel(m, char);

	}
})


const CmdWest = NewCommand<Rpg>({
	cls: Rpg,
	alias: 'w',
	data: CommandData('west', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await SendBlock(m, await rpg.game.move(char, 'w'));
		rpg.checkLevel(m, char);

	}
});