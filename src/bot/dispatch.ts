import { BotContext, ContextSource } from './botcontext';
import { Command } from './command';

const QuoteRE = /“|”/g;

export type CommandOpts = Partial<Command>;

/**
 * @const {RegExp} SplitRE - splits input line into arguments.
 */
//const SplitRE = /"([^"]*)"|“([^”]*)”|\s*\b([^"]+)\b/g;

export default class Dispatch {

	get prefix() { return this.cmdLine.prefix; }

	private cmdLine: CmdLine;

	/**
	 *
	 * @param {string} cmdPrefix
	 */
	constructor(cmdPrefix: string = '!') {
		this.cmdLine = new CmdLine(cmdPrefix);
	}

	/**
	 *
	 * @param {string} name
	 * @returns {(Command|null)}
	 */
	getCommand(name: string) { return this.cmdLine.getCommand(name); }

	/**
	 * Parse a line of input.
	 * @param {string} input - text input.
	 * @returns - command found on input, or null.
	 */
	parseLine(input: string) {
		return this.cmdLine.setInput(input);
	} //

	/**
	 *
	 * @param {Command} cmd
	 * @param {Array} leadArgs
	 */
	dispatch(cmd: Command, leadArgs: any[]) {

		const lineArgs = this.cmdLine.args;
		if (lineArgs) leadArgs = leadArgs.concat(lineArgs);

		if (cmd.args) return cmd.func.apply(null, leadArgs.concat(cmd.args));
		else return cmd.func.apply(null, leadArgs);

	}

	/**
	 *
	 * @param {BotContext} context
	 * @param {Command} cmd
	 * @param {Array} leadArgs
	 * @returns {Promise}
	 */
	routeCmd<T extends ContextSource>(context: BotContext<T>, cmd: Command, leadArgs: any[]) {

		const lineArgs = this.cmdLine.args;
		if (lineArgs) leadArgs = leadArgs.concat(lineArgs);

		if (cmd.args) return context.routeCommand(cmd, leadArgs.concat(cmd.args));
		return context.routeCommand(cmd, leadArgs);
	}

	/**
	 *
	 * @param  name - Name of command.
	 * @param  desc - Command Usage details.
	 * @param  func - Function to call.
	 * @param cmdClass - Class which owns the function.
	 * @param  opts - Command options.
	 * @param opts.minArgs
	 * @param {number} [opts.maxArgs]
	 * @param {bool}[opts.hidden]
	 * @param {string}[opts.group]
	 * @param {*[]} [opts.args] - Arguments to pass after all other arguments to command.
	 */
	addContextCmd(name: string, desc: string, func: Function, cmdClass: any, opts?: CommandOpts) {

		try {
			if (this.getCommand(name)) {
				return false;
			}
			const cmd = new Command(name, func, {
				desc: desc,
				instClass: cmdClass,
				...opts
			});
			this.regCmd(cmd);
		} catch (e) { console.error(e); }

	}

	/**
	 *
	 * @param name
	 * @param desc
	 * @param func
	 * @param {Object} [opts=null]
	 */
	add(name: string, desc: string | null | undefined, func: Function, opts?: CommandOpts) {

		try {

			const cmd = new Command(name, func, { desc: desc ?? '', ...opts });
			this.regCmd(cmd);

		} catch (e) { console.error(e); }

	}

	/**
	 *
	 * @param cmd
	 */
	regCmd(cmd: Command) {

		this.cmdLine.commands[cmd.name] = cmd;
		const alias = cmd.alias;
		if (alias) {

			if (typeof (alias) === 'string') this.cmdLine.commands[alias] = cmd;
			else if (Array.isArray(alias)) {
				alias.every(v => this.cmdLine.commands[v] = cmd);
			}

		}

	}

	/**
	 * {Object[string->command]}
	 */
	get commands() { return this.cmdLine.commands; }

	/**
	 *
	 * @param {string} name
	 */
	clearCmd(name: string) { return delete this.commands[name]; }

}

class CmdLine {

	readonly commands: { [name: string]: Command } = {};

	/**
	 * @property {string[]} args - current arguments on command line.
	 */
	get args() { return this._args; }

	private _args?: string[] | null;

	/**
	 * @property {string} prefix - bot command prefix.
	 */
	readonly prefix: string;

	/**
	 * Length of command prefix.
	 */
	private readonly prefixLen: number;

	constructor(cmdPrefix = '!') {

		this.prefix = cmdPrefix;
		this.prefixLen = cmdPrefix ? cmdPrefix.length : 0;

	}

	/**
	 *
	 * @param {string} name
	 */
	getCommand(name: string) {
		return this.commands[name.toLowerCase()];
	}


	/**
	 *
	 * @param {string} str
	 * @returns {Command|null} The command found on the input line.
	 */
	setInput(str: string) {

		str = str.trim();

		// cmd prefix.
		if (!str.startsWith(this.prefix)) return null;

		const argIndex = str.indexOf(' ', this.prefixLen);
		let cmd: Command;

		if (argIndex < 0) {

			cmd = this.commands[str.slice(this.prefixLen).toLowerCase()];
			this._args = null;

		} else {

			cmd = this.commands[str.slice(this.prefixLen, argIndex).toLowerCase()];
			if (!cmd) return null;

			this.readArgs(str.slice(argIndex), cmd);

		}

		return cmd;

	}

	private readArgs(argstr: string, cmd: Command) {

		// replace fancy quotes.
		argstr = argstr.replace(QuoteRE, '"');

		if (!cmd.maxArgs) this._args = this.splitArgs(argstr);
		else {
			if (cmd.group === 'right') this._args = this.groupRight(argstr, cmd.maxArgs);
			else this._args = this.groupLeft(argstr, cmd.maxArgs);
		}

	}

	private splitArgs(str: string) {

		const args = [];
		const len = str.length;
		let start = 0;
		let end;
		let char;

		while (true) {

			// skip spaces.
			while (start < len && str.charAt(start) === ' ') start++;
			if (start >= len) break;

			char = str.charAt(start);
			end = start + 1;

			if (char === '"') {

				// quoted arg.
				while (end < len && str.charAt(end) !== '"') end++;
				args.push(str.slice(start + 1, end));

			} else {

				while (end < len && str.charAt(end) !== ' ') end++;
				args.push(str.slice(start, end));
			}

			start = end + 1;

		}

		return args;

	}


	// groups args on right to max count.
	private groupRight(str: string, argCount: number) {

		const args = [];
		const len = str.length;
		let start = 0;
		let end;

		while (true) {

			// skip spaces.
			while (start < len && str.charAt(start) === ' ') start++;
			if (start >= len) break;

			argCount--;
			if (argCount <= 0) {
				if (start < len) args.push(this.trimQuote(str.slice(start)));
				break;
			}

			const char = str.charAt(start);
			end = start + 1;

			if (char === '"') {

				// quoted arg.
				while (end < len && str.charAt(end) !== '"') end++;
				args.push(str.slice(start + 1, end));

			} else {

				while (end < len && str.charAt(end) !== ' ') end++;
				args.push(str.slice(start, end));
			}

			start = end + 1;

		}

		return args;

	}

	// groups args on left to max count.
	private groupLeft(str: string, argCount: number) {

		const args = [];
		let start = str.length - 1;
		let end;

		while (true) {

			// skip spaces.
			while (start >= 0 && str.charAt(start) === ' ') start--;
			if (start <= 0) break;

			argCount--;
			if (argCount <= 0) {
				if (start >= 0) args.unshift(this.trimQuote(str.slice(0, start + 1)));
				break;
			}

			const char = str.charAt(start);
			end = start - 1;

			if (char === '"') {

				// quoted arg.
				while (end >= 0 && str.charAt(end) !== '"') end--;
				args.unshift(str.slice(end + 1, start));

			} else {

				while (end >= 0 && str.charAt(end) !== ' ') end--;
				args.unshift(str.slice(end + 1, start + 1));
			}

			start = end - 1;

		}

		return args;

	}

	private trimQuote(str: string) {

		str = str.trim();
		const len = str.length;
		let start = 0;
		if (len > 0 && str.charAt(0) === '"') start++;
		let end = len - 1;
		if (end > 0 && str.charAt(end) === '"') end--;

		if (end < start) return '';
		return str.slice(start, end + 1);

	}

}