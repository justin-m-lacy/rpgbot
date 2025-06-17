import { PermissionResolvable, SlashCommandBuilder, type Interaction } from "discord.js";

export type CommandFunc = (it: Interaction) => Promise<any> | void;

export type CommandInfo = {
	name: string,
	data: SlashCommandBuilder,
	exec: CommandFunc
}

export function CreateCommand(name: string, desc: string, handler: CommandFunc,
	into?: CommandInfo[], ...rest: any) {

	const b = new SlashCommandBuilder().setName(name).setDescription(desc);

	const cmd = {
		name,
		data: b,
		exec: handler
	}

	into?.push(cmd);


	return cmd;

}

export type CommandModule = {
	GetCommands(): CommandInfo[]
}

/**
 * Check if loaded js module has command creation function.
 * @param module 
 */
export const HasCommands = (module?: any): module is CommandModule => {
	return module && typeof module === 'object' && typeof module.GetCommands === 'function';
}

export class Command<F extends Function = Function> {

	/**
	 * @property {string}
	 */
	readonly name: string = '';

	/**
	 * @property {string|string[]}
	 */
	readonly alias: string | string[] | null = null;

	/**
	 * @property Whether the command is implemented as a direct function call.
	 */
	get isDirect(): boolean { return this.instClass == null; }

	/**
	 * @property Whether the command is linked to a context class.
	 */
	get isContext(): boolean { return this.instClass != null; }

	/**
	 * @property {Object} Object class to instantiate for every bot context.
	 */
	readonly instClass?: any;

	_module?: string | null;

	/**
	 * @property {string} name of module that the command belongs to.
	 */
	get module() {
		return this._module ?? (this.instClass ? this.instClass.constructor.name : 'unknown');
	}
	set module(v: string | null) {
		this._module = v;
	}

	readonly func: F;

	_usage?: string;

	/**
	 * @property {string} Detailed command usage information.
	 */
	get usage() { return this._usage || this.desc; }
	set usage(v: string) { this._usage = v; }

	/**
	 * @property {string} short description of command.
	 */
	readonly desc: string = 'Unknown';

	/**
	 * The way command line words are grouped into commmand arguments.
	 * Valid options are 'left' or 'right'.
	 */
	readonly group?: string;

	/**
	 *  Hidden commands are not displayed in the help list.
	 */
	readonly hidden: boolean = false;

	/**
	 * Additional args to pass to command function.
	 */
	readonly args?: any[];

	/**
	 * minimum arguments which must be supplied with the command.
	 */
	readonly minArgs: number = 0;

	/**
	 * maximum number of arguments that can be supplied to the command.
	 */
	readonly maxArgs: number | null = null;

	/**
	 * Default permissions required to use this command.
	 * Can be overridden by BotContext Access.
	 */
	readonly access?: PermissionResolvable;

	/**
	 * immutable commands cannot have their access level changed.
	 */
	readonly immutable: boolean = false;

	/**
	 * 
	 * @param name 
	 * @param func 
	 * @param opts
	 */
	constructor(name: string, func: F, opts?: Partial<Command>) {

		this.name = name;
		this.func = func;

		if (opts) Object.assign(this, opts);

	}

	/**
	 * 
	 * @param {string} cmd
	 * @returns {boolean}
	 */
	isMatch(cmd: string) {

		if (this.name === cmd) return true;

		if (this.alias) {
			if (typeof (this.alias) === 'string') return cmd === this.alias;
			return this.alias.includes(cmd);
		}

	}

}