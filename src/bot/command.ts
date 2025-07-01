import type { BotContext, ContextSource } from "@/bot/botcontext";
import type { ChatCommand } from "@/bot/cmd-wrapper";
import type { DiscordBot } from "@/bot/discordbot";
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandNumberOption, SlashCommandStringOption, type ApplicationCommandOptionBase, type ButtonInteraction, type SharedSlashCommand } from "discord.js";

type BaseCommandFunc = (it: ChatCommand, bot: DiscordBot) => Promise<any> | void | undefined;

export type CommandFunc<T extends object> = (it: ChatCommand, cls: T, ...rest: any[]) => Promise<any> | void | undefined;

export type ChatAction = ChatInputCommandInteraction | ButtonInteraction;

export type CommandModule = {
	GetCommands(): Command[]
}

/**
 * Class with a constructor that takes a BotContext and returns
 * data instance to be provided to exec() command function.
 */
type CommandClass<T extends object, S extends ContextSource = ContextSource> = {
	new(context: BotContext<S>): T
	load?(): Promise<void>;
}

type BaseCommand = {

	id: string;

	/// alias for command.
	alias?: string;

	data: SlashCommandBuilder | SharedSlashCommand;

	hidden?: boolean,

	/**
	 * greedy-group text params on right or left.
	 */
	merge?: 'start' | 'end',

	minArgs: number,

	maxArgs: number,

	//isContext: boolean

}
/**
 * Command not relying on stored instance data or BotContext.
 */
type UntypedCommand = BaseCommand & {
	exec: BaseCommandFunc;
}

/**
 * Command with a shared class instantiated for every context the command is run in.
 * e.g. A separate Rpg instance is created for every Discord Guild that runs Rpg commands.
 * This stored Rpg instance is provided to the exec() function whenever an Rpg command is
 * run from that guild.
 */
type TypedCommand<T extends object, S extends ContextSource = ContextSource> = BaseCommand & {

	/**
	 * Class to instantiate for each unique context command is run on.
	 */
	cls: T extends object ? CommandClass<T, S> : never;
	/**
	 * Command to execute for command, along with instantiated data class.
	 */
	exec: CommandFunc<T>;
}

export type Command<T extends object | undefined = any> = T extends Object ? TypedCommand<T> : UntypedCommand;

export const StrOpt = (name: string, desc: string, required: boolean = false) => new SlashCommandStringOption().setName(name).setDescription(desc).setRequired(required);

export const StrChoices = (name: string, desc: string, choices: Array<{ name: string, value: string }>) => {
	return new SlashCommandStringOption().setName(name).setDescription(desc).addChoices(...choices);
}

export const NumOpt = (name: string, desc: string, min: number = 0) => new SlashCommandNumberOption().setName(name).setDescription(desc).setMinValue(min);

export const IsTypedCmd = (cmd: Command): cmd is TypedCommand<any> => 'cls' in cmd;
/**
 * Allows automate add 'id' and other useful command funcs.
 * @param cmd 
 * @returns 
 */
export const NewCommand = <T extends object | undefined>(
	cmd: Omit<Command<T>, | 'id' | 'maxArgs' | 'minArgs'>): Command<T> => {

	return {
		id: cmd.data.name,
		minArgs: cmd.data.options.filter(
			v => (v as any).required
		).length,
		maxArgs: cmd.data.options.length,
		...cmd
	} as Command<T>;

}

export const CommandData = (name: string, desc: string, opts?: ApplicationCommandOptionBase[]
) => {

	const cmd = new SlashCommandBuilder().setName(name).setDescription(desc);
	if (opts) {
		cmd.options.push(...opts)
	}
	return cmd;

}

export const IsCommand = (module?: any): module is Command => {
	return module && typeof module === 'object' &&
		('exec' in module && typeof module.exec === 'function') &&
		('data' in module && module.data instanceof SlashCommandBuilder);
}
/**
 * Check if loaded js module has command creation function.
 * @param module 
 */
export const IsCommandModule = (module?: any): module is CommandModule => {
	return module && typeof module === 'object' && typeof module.GetCommands === 'function';
}