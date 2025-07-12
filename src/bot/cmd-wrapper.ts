import type { Command } from "@/bot/command";
import { SendableChannels, type BaseMessageOptions, type ButtonInteraction, type ChatInputCommandInteraction, type Guild, type Message, type MessagePayload, type User } from "discord.js";

export type ChatCommand = ChatInputCommandInteraction | ICmdWrap;

export type MessageOpt<T> = {

	name: string;
	value: T;
	required?: boolean;

}

type CmdArg<T extends string | number> = {
	name: string,
	value: T
}

export class MsgOptions {

	readonly opts: Record<string, string | undefined> = {};

	getString(key: string, required: boolean): string;
	getString(key: string, required?: false): string | null;
	getString(key: string, required?: boolean): string | null {

		if (required) {
			return this.opts[key]!
		} else {
			return this.opts[key] ?? null;
		}

	}

	getInteger(key: string, required: boolean): number;
	getInteger(key: string, required?: false): number | null;
	getInteger(key: string, required?: boolean) {
		if (required) {
			return Number.parseInt(this.opts[key]!);
		}
		const v = this.opts[key];
		if (v === undefined) return null;
		return Number.parseInt(v);

	}

	getNumber(key: string, required: boolean): number;
	getNumber(key: string, required?: false): number | null;
	getNumber(key: string, required?: boolean) {
		if (required) {
			return Number.parseFloat(this.opts[key]!);
		}
		const v = this.opts[key];
		if (v === undefined) return null;
		return Number.parseFloat(v);

	}

	addOption(key: string, value: string) {
		this.opts[key] = value;
	}

	constructor(opts?: CmdArg<any>[]) {

		if (opts) {
			for (let i = 0; i < opts.length; i++) {
				this.opts[opts[i].name] = opts[i].value;
			}
		}

	}

}

const SymWrap = Symbol('MsgWrap');
export const IsWrappedCmd = (m: any): m is ICmdWrap => {
	return m && typeof m === 'object' && m.symbol == SymWrap;
}


export interface ICmdWrap {

	get symbol(): Symbol;

	get user(): User;

	get guild(): Guild | null;

	get channel(): SendableChannels | null;

	inGuild(): boolean;

	reply(opts: string | MessagePayload | BaseMessageOptions): Promise<any>;

	readonly options: MsgOptions;


}
export class ButtonAction implements ICmdWrap {

	options: MsgOptions = new MsgOptions();

	get symbol() { return SymWrap; }
	readonly m: ButtonInteraction;

	get channel() {
		return this.m.channel as SendableChannels;
	}

	/**
	 * Underlying command the button represents.
	 */
	readonly cmd: Command;

	constructor(cmd: Command, act: ButtonInteraction, opts?: Record<string, string>) {

		this.m = act;
		this.cmd = cmd;

		if (opts) {
			for (const k in opts) {
				this.addOption(k, opts[k])
			}
		}

	}

	addOption(k: string, val: string) {
		this.options.addOption(k, val);
	}

	reply(opts: string | MessagePayload | BaseMessageOptions) {
		return this.m.reply(opts);
	}

	get user(): User {
		return this.m.user;
	}
	get guild(): Guild | null {
		return this.m.guild;
	}
	inGuild(): boolean {
		return this.m.inGuild();
	}


}

export class MsgWrap implements ICmdWrap {

	get symbol() { return SymWrap };

	readonly m: Message;

	readonly options: MsgOptions;

	get user() { return this.m.author; }

	get guild() { return this.m.guild }

	get channel() { return this.m.channel as SendableChannels }

	inGuild() { return this.m.inGuild() }

	constructor(m: Message, opts: CmdArg<any>[]) {

		this.m = m;
		this.options = new MsgOptions(opts);

	}
	reply(opts: string | MessagePayload | BaseMessageOptions) {
		return this.m.reply(opts);
	}

}

/*
export class CommandOpt<T extends 'integer' | 'number' | 'string'> {

	type: 'integer' | 'number' | 'string' = 'string';
	greedy: boolean = false;

	required: boolean;
	readonly name: string;


	constructor(name: string, required: boolean = false) {

		this.name = name;
		this.required = required;

	}

	parse(text: string): any {
		return text;
	}

	setRequired(required: boolean) {
		this.required = required;
	}

}

export class StringOpt extends CommandOpt<'string'> {

	parse(text: string) {
		return text;
	}
}

export class IntegerOpt extends CommandOpt<'number'> {

	parse(text: string) {
		return Number.parseInt(text);
	}
}

export class NumberOpt extends CommandOpt<'number'> {

	parse(text: string) {
		return Number.parseFloat(text);
	}
}*/

/*
export class ChoicesArg<T extends string | number> extends CommandOpt<'integer'> {

	readonly values: CmdArg<T>[];

	constructor(name: string) {

		super(name);

		this.values = [];
	}

	add(name: string, value: T) {
		this.values.push({ name, value });
	}

}*/