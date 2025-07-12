import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt, type Command } from "@/bot/command";
import { WorldLocActions } from "commands/look";
import { ReplyBlock, SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { DirVal } from "rpg/world/loc";


export function GetCommands(): Command[] {
	return [CmdMove, CmdNorth, CmdSouth, CmdEast, CmdWest];
}


type DirParam = {
	dir?: DirVal
}

async function exec(this: ReturnType<typeof NewCommand> & DirParam, m: ChatCommand, rpg: Rpg) {

	const char = await rpg.myCharOrErr(m, m.user);
	if (!char) return;

	const dir = this.dir ?? m.options.getString('dir', true) as DirVal;
	if (!dir) {

		const loc = await rpg.world.getOrGen(char.at);
		return SendPrivate(m, 'Move in what direction?', {
			components: WorldLocActions(loc)
		})

	}

	await rpg.game.action('move', char, dir);
	const loc = await rpg.world.getOrGen(char.at);
	return ReplyBlock(m, char.flushLog(), {
		components: WorldLocActions(loc)
	});

}

const CmdMove = NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('move', 'Move in given direction')
		.addStringOption(StrOpt('dir', 'Direction to move')),
	exec,

});

const CmdNorth = NewCommand<Rpg, DirParam>({
	cls: Rpg,
	alias: 'n',
	dir: 'n',
	data: CommandData('north', 'Move in given direction'),
	exec
});

const CmdSouth = NewCommand<Rpg, DirParam>({
	cls: Rpg,
	alias: 's',
	dir: 's',
	data: CommandData('south', 'Move in given direction'),
	exec
});

const CmdEast = NewCommand<Rpg, DirParam>({
	cls: Rpg,
	alias: 'e',
	dir: 'e',
	data: CommandData('east', 'Move in given direction'),
	exec
})


const CmdWest = NewCommand<Rpg, DirParam>({
	cls: Rpg,
	alias: 'w',
	dir: 'w',
	data: CommandData('west', 'Move in given direction'),
	exec
});