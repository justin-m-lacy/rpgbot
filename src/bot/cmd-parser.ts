import type { MessageOpt } from "@/bot/cmd-wrapper";
import type { Command } from "@/bot/command";
import { ApplicationCommandOptionBase, ApplicationCommandOptionType } from "discord.js";
import { NotEnoughArgs } from "rpg/util/errors";

const splitter = /(\'|\w+)|"([^"]+)"|“([^”“]+)”/gi;

const ParseOpType = (text: string, type: ApplicationCommandOptionType) => {
	if (type === ApplicationCommandOptionType.String) {
		return text;
	} else if (type === ApplicationCommandOptionType.Integer) {
		return Number.parseInt(text);
	} else if (type === ApplicationCommandOptionType.Number) {
		return Number.parseFloat(text);
	} else if (type === ApplicationCommandOptionType.Boolean) {
		const tl = text.toLowerCase();
		return tl === 't' || tl === 'true' ? true : false;
	}
}

export class CmdParser {

	constructor() {
	}

	/**
	 * Parse options from text.
	 * @param text 
	 * @param cmd 
	 */
	parse(text: string, cmd: Command<any>): MessageOpt<any>[] {

		if (cmd.maxArgs === 0) return [];

		const parts: string[] = [];
		let p: RegExpExecArray | null;
		while (p = splitter.exec(text)) {
			parts.push(p[1] ?? p[2] ?? p[3]);
		}
		if (parts.length == 0) parts.push(text);

		if (parts.length < cmd.minArgs) {
			throw new NotEnoughArgs(cmd.id, parts.length, cmd.minArgs);
		}

		/**
		 * TODO: problems if non-required options are in middle
		 * of the parse line.
		 * Ambiguous parsing.
		 */

		const excess = parts.length - cmd.maxArgs;
		if (cmd.merge !== 'end') {
			return this.groupArgsLeft(
				parts,
				cmd.data.options as ApplicationCommandOptionBase[],
				excess);
		} else {
			return this.groupArgsRight(
				parts,
				cmd.data.options as ApplicationCommandOptionBase[],
				excess);
		}

	}


	/**
	 * join number of start args, ignoring non-string opts.
	 * @param excess - number of parts in excess of max commands.
	 * i.e. number of parts that need to be joined into single string opt.
	 */
	private groupArgsLeft(parts: string[], ops: ApplicationCommandOptionBase[], excess: number) {

		const args: MessageOpt<any>[] = [];

		let partInd: number = 0;

		for (let argInd = 0; argInd < ops.length; argInd++) {

			const op = ops[argInd];
			let raw: string;

			if (excess > 0 && op.type === ApplicationCommandOptionType.String) {
				raw = parts.slice(partInd, partInd + excess + 1).join(' ');
				/// ind: +1 below, + excess parts
				partInd += excess;
				excess = 0;
			} else {
				raw = parts[partInd];
			}
			partInd++;

			args.push({ name: op.name, required: op.required, value: ParseOpType(raw, op.type) });

		}

		return args;

	}

	/**
	 * join number of start args, ignoring non-string opts.
	 * @param excess - number of parts in excess of max commands.
	 * i.e. number of parts that need to be joined into single string opt.
	 */
	private groupArgsRight(parts: string[], ops: ApplicationCommandOptionBase[], excess: number,) {

		const args: MessageOpt<any>[] = [];

		let partInd: number = parts.length - 1;

		for (let argInd = ops.length - 1; argInd >= 0; argInd--) {

			const op = ops[argInd];

			let raw: string;

			if (excess > 0 && op.type === ApplicationCommandOptionType.String) {
				raw = parts.slice(partInd - excess, partInd + 1).join(' ');
				/// ind: +1 below, + excess parts
				partInd -= excess;
				excess = 0;
			} else {
				raw = parts[partInd];
			}
			partInd--;

			args.push({ name: op.name, required: op.required, value: ParseOpType(raw, op.type) });

		}

		return args;

	}

}