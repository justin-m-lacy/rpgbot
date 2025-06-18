import type { BotContext } from "@/bot/botcontext";
import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption, type ApplicationCommandOptionBase } from "discord.js";

export type CommandFunc<T extends object | undefined = undefined> = (it: ChatAction, cls: T) => Promise<any> | void;

export type ChatAction = ChatInputCommandInteraction;

export type CommandModule = {
	GetCommands(): CommandData[]
}

type CommandClass<T extends object> = {
	new(context: BotContext): T
	load?(): Promise<void>;
}

export type CommandData<T extends object | undefined = undefined> = {
	data: SlashCommandBuilder,
	exec: CommandFunc<T>,
	cls?: T extends object ? CommandClass<T> : undefined
}

export const StrOpt = (name: string, desc: string) => new SlashCommandStringOption().setName(name).setDescription(desc);

export const StrChoices = (name: string, desc: string, choices: Array<{ name: string, value: string }>) => {
	return new SlashCommandStringOption().setName(name).setDescription(desc).addChoices(...choices);
}

export const NewCommand = (name: string, desc: string, opts?: ApplicationCommandOptionBase[]
) => {

	const cmd = new SlashCommandBuilder().setName(name).setDescription(desc);
	if (opts) {
		cmd.options.push(...opts)
	}
	return cmd;

}

export function CreateCommand<T extends object | undefined>(name: string, desc: string, handler: CommandFunc<T>,
	into?: CommandData<T>[], ...rest: any) {

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