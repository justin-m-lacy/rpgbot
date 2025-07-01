import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt, type Command } from "@/bot/command";
import { CustomButton } from "@/bot/command-map";
import { SendPrivate } from "@/utils/display";
import { ToActionRows } from "rpg/actions";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { ToDirStr, type DirVal, type Loc } from "rpg/world/loc";


export function GetCommands(): Command[] {
	return [CmdMove, CmdNorth, CmdSouth, CmdEast, CmdWest];
}

export const MoveButtons = (loc: Loc) => {

	const dirs: DirVal[] = [];
	let k: DirVal;
	for (k in loc.exits) {
		dirs.push(k);
	}

	return ToActionRows(dirs.map(v => CustomButton({

		customId: 'move',
		label: ToDirStr(v)

	}, {
		dir: v
	})));

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

			const loc = await rpg.world.getOrGen(char.loc);
			return SendPrivate(m, 'Move in what direction?', {
				components: MoveButtons(loc)
			})

		}

		await rpg.game.move(char, dir);
		const loc = await rpg.world.getOrGen(char.loc);
		return ReplyBlock(m, char.getLog(), {
			components: MoveButtons(loc)
		});

	}
});

const CmdNorth = NewCommand<Rpg>({
	cls: Rpg,
	alias: 'n',
	data: CommandData('north', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await rpg.game.move(char, 'n');
		const loc = await rpg.world.getOrGen(char.loc);
		return ReplyBlock(m, char.getLog(), {
			components: MoveButtons(loc)
		});

	}
});

const CmdSouth = NewCommand<Rpg>({
	cls: Rpg,
	alias: 's',
	data: CommandData('south', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await rpg.game.move(char, 's');
		const loc = await rpg.world.getOrGen(char.loc);
		return ReplyBlock(m, char.getLog(), {
			components: MoveButtons(loc)
		});

	}
});

const CmdEast = NewCommand<Rpg>({
	cls: Rpg,
	alias: 'e',
	data: CommandData('east', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await rpg.game.move(char, 'e');
		const loc = await rpg.world.getOrGen(char.loc);
		return ReplyBlock(m, char.getLog(), {
			components: MoveButtons(loc)
		});

	}
})


const CmdWest = NewCommand<Rpg>({
	cls: Rpg,
	alias: 'w',
	data: CommandData('west', 'Move in given direction'),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user);
		if (!char) return;

		await rpg.game.move(char, 'w');
		const loc = await rpg.world.getOrGen(char.loc);
		return ReplyBlock(m, char.getLog(), {
			components: MoveButtons(loc)
		});

	}
});