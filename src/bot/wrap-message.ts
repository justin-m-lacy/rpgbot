import { type BaseMessageOptions, type ChatInputCommandInteraction, type Message, type MessagePayload } from "discord.js";

export type ChatCommand = ChatInputCommandInteraction | MsgWrap;

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

	constructor(opts?: CmdArg<any>[]) {

		if (opts) {
			for (let i = 0; i < opts.length; i++) {
				this.opts[opts[i].name] = opts[i].value;
			}
		}

	}

}
export class MsgWrap {

	readonly m: Message;

	readonly options: MsgOptions;

	get user() { return this.m.author; }

	get guild() { return this.m.guild }

	inGuild() { return this.m.inGuild() }

	constructor(m: Message, opts: CmdArg<any>[]) {

		this.m = m;

		console.log(`args count: ${opts.length}`);

		this.options = new MsgOptions(opts);

	}
	reply(opts: string | MessagePayload | BaseMessageOptions) {

		if (typeof opts === 'string') {
			return this.m.reply(opts);
		} else {

			return this.m.reply(opts);
		}

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