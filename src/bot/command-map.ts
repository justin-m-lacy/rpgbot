import { ButtonAction } from "@/bot/cmd-wrapper";
import type { Command } from "@/bot/command";
import { ButtonBuilder, ButtonStyle, type ButtonComponentData, type ButtonInteraction } from "discord.js";


/**
 * Character for splitting customId (button) commands.
 */
const CmdSplitChar = '/';


/**
 * Create a new button with command-id and properties
 * encoded in button customId
 * @param opts
 * @param opts.customId - button id, usually just command id.
 * @param props 
 * @returns 
 */
export const CustomButton = (
	opts: Partial<ButtonComponentData> & { customId: string, label: string },
	props?: Record<string, any>) => {

	if (!opts.label || opts.label.length == 0) console.warn(`no label: ${opts.customId}`);
	opts.label ??= opts.customId;
	opts.style ??= ButtonStyle.Secondary;

	if (props) {
		for (const k in props) {
			if (props[k]) {
				opts.customId += CmdSplitChar + k + '=' + props[k];
			}
		}
	}

	return new ButtonBuilder(opts);


}

export class Commands {

	readonly commands = new Map<string, Command<any>>();

	constructor() {

	}

	/**
	 * Parse button interaction into Button command data.
	 * @param it 
	 * @returns 
	 */
	parseButton(it: ButtonInteraction) {

		const parts = it.customId.split(CmdSplitChar);
		const cmd = this.commands.get(parts[0]);
		if (!cmd) return null;

		const act = new ButtonAction(cmd, it);

		for (let i = 1; i < parts.length; i++) {

			const kvp = parts[i];
			const ind = kvp.indexOf('=')
			if (ind > 0) {
				act.addOption(kvp.slice(0, ind), kvp.slice(ind + 1));
			}

		}


		return act;

	}

	entries() { return this.commands.entries() }

	values() { return this.commands.values() }

	get(k: string) { return this.commands.get(k) }

	set(k: string, cmd: Command) {
		this.commands.set(k, cmd);
		if (cmd.alias) this.commands.set(cmd.alias, cmd);
	}

}

export const CommandMap = () => {
	return new Commands();
}