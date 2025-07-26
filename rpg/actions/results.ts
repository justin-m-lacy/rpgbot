import { TestRequire, type RawIf, type TRequire } from "rpg/actions/requires.js";
import { ParseValue, ValueOrFb } from "rpg/parsers/values";
import { AddValues } from "rpg/values/apply";
import { ParsePaths, type Path } from "rpg/values/paths";
import type { Numeric, TValue } from "rpg/values/types";

export type RawResult = {
	if?: RawIf,
	set?: Record<string, any>,
	add: Record<string, any>,
	fb?: string,
	err?: string
}

type BaseResult<T extends object> = {
	// condition for result to apply.
	if?: RawIf,
	fb?: string,
	err?: string,
	apply: (targ: T, dt?: number) => boolean;
}

export type TResult<T extends object> = {

	if?: TRequire<T>,
	set?: Path<Numeric | string | object>,
	add?: Path<TValue>,
	fb?: string,
	err?: string,
	apply: (targ: T, dt?: number) => boolean;

}

export const ParseResult = <T extends object>(raw: RawResult): TResult<T> => {

	return new Result<T>({

		if: raw.if,
		set: raw.set ? ParsePaths(raw.set, 'set', ValueOrFb) : undefined,
		add: raw.add ? ParsePaths(raw.add, 'add', ParseValue) : undefined,
		fb: raw.fb,
		err: raw.err,
	});

}

export class Result<T extends object> {

	err?: string;
	fb?: string;
	if?: TRequire<T>;
	set?: Path<Numeric | string | object>;
	add?: Path<TValue>;

	constructor(opts: {
		if?: TRequire<T>,
		set?: Path<TValue | string | object>,
		add?: Path<TValue>,
		fb?: string, err?: string
	}) {

		this.if = opts.if;
		this.set = opts.set;
		this.add = opts.add;
		this.fb = opts.fb;
		this.err = opts.err;

	}

	apply(targ: T, dt: number = 1): boolean {

		if (this.if) {
			if (!TestRequire(targ, this.if)) {
				return false;
			}
		}

		if (this.add) {
			AddValues(targ, this.add, dt);
		}

		if (this.set) {
			for (const k in this.set) {
				(targ as any)[k] = this.set[k];
			}
		}

		return true;

	}

}