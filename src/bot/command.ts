import type { BotContext } from "@/bot/botcontext";
import type { DiscordBot } from "@/bot/discordbot";
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandNumberOption, SlashCommandStringOption, type ApplicationCommandOptionBase, type SlashCommandOptionsOnlyBuilder } from "discord.js";

type BaseCommandFunc = (it: ChatAction, bot: DiscordBot) => Promise<any> | void | undefined;

export type CommandFunc<T extends object> = (it: ChatAction, cls: T) => Promise<any> | void | undefined;

export type ChatAction = ChatInputCommandInteraction;

export type CommandModule = {
	GetCommands(): CommandData[]
}

type CommandClass<T extends object> = {
	new(context: BotContext): T
	load?(): Promise<void>;
}

type BaseCommand = {
	data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
}
type UntypedCommand = BaseCommand & {
	exec: BaseCommandFunc,
}

type TypedCommand<T extends object> = BaseCommand & {
	exec: CommandFunc<T>,
	cls: T extends object ? CommandClass<T> : never;
}

export type CommandData<T extends object | undefined = undefined> = T extends Object ? TypedCommand<T> : UntypedCommand;

export const StrOpt = (name: string, desc: string, required: boolean = false) => new SlashCommandStringOption().setName(name).setDescription(desc).setRequired(required);

export const StrChoices = (name: string, desc: string, choices: Array<{ name: string, value: string }>) => {
	return new SlashCommandStringOption().setName(name).setDescription(desc).addChoices(...choices);
}

export const NumOpt = (name: string, desc: string, min: number = 0) => new SlashCommandNumberOption().setName(name).setDescription(desc).setMinValue(min);

export const NewCommand = (name: string, desc: string, opts?: ApplicationCommandOptionBase[]
) => {

	const cmd = new SlashCommandBuilder().setName(name).setDescription(desc);
	if (opts) {
		cmd.options.push(...opts)
	}
	return cmd;

}

export function CreateCommand(
	name: string, desc: string,
	handler: BaseCommandFunc,
	into?: CommandData[], ...rest: any) {

	const b = new SlashCommandBuilder().setName(name).setDescription(desc);

	const cmd = {
		data: b,
		exec: handler
	}

	into?.push(cmd);


	return cmd;

}

/**
 * Check if loaded js module has command creation function.
 * @param module 
 */
export const IsCommandModule = (module?: any): module is CommandModule => {
	return module && typeof module === 'object' && typeof module.GetCommands === 'function';
}