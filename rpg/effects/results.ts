import { Char } from "rpg/char/char";
import { TActor } from "rpg/char/mobs";
import { TestRequire, type RawIf, type TRequire } from "rpg/effects/requires.js";
import { TSpawnOpts } from "rpg/effects/spawn";
import type { Game } from "rpg/game";
import { ParseValue, ValueOrFb } from "rpg/parsers/values";
import { AddValues } from "rpg/values/apply";
import { ParsePaths, type Path } from "rpg/values/paths";
import { ParsePercent, Percent } from "rpg/values/percent";
import type { Numeric, TValue } from "rpg/values/types";

export type RawResult = {
	if?: RawIf,
	set?: Record<string, any>,
	add: Record<string, any>,
	fb?: string,
	err?: string,
	pct?: number,
	destroy?: boolean
}

type BaseResult<T extends object> = {
	// condition for result to apply.
	if?: RawIf,
	fb?: string,
	err?: string,
	apply: (targ: T, dt?: number) => boolean;
}

type TResult<T extends object> = {

	if?: TRequire<T>,
	set?: Path<Numeric | string | object>,
	add?: Path<TValue>,
	fb?: string,
	err?: string,
	pct?: Percent,
	apply: (game: Game, targ: T, dt?: number) => boolean;

}

export const ParseResult = <T extends TActor>(raw: RawResult): TResult<T> => {

	return new Result<T>({

		if: raw.if,
		set: raw.set ? ParsePaths(raw.set, 'set', ValueOrFb) : undefined,
		add: raw.add ? ParsePaths(raw.add, 'add', ParseValue) : undefined,
		fb: raw.fb,
		err: raw.err,
		pct: raw.pct ? ParsePercent(raw.pct) : undefined
	});

}

export class SpawnResult {

	apply(game: Game, targ: Char, dt: number = 1): boolean {

		return true;

	}

}

export class Result<T extends TActor> {

	err?: string;
	fb?: string;
	if?: TRequire<T>;
	set?: Path<Numeric | string | object>;
	add?: Path<TValue>;
	pct?: Percent;
	spawn?: TSpawnOpts[];
	destroy?: boolean;

	constructor(opts: {
		if?: TRequire<T>,
		set?: Path<TValue | string | object>,
		add?: Path<TValue>,
		pct?: Percent,
		destroy?: boolean,
		fb?: string, err?: string
	}) {

		this.if = opts.if;
		this.set = opts.set;
		this.add = opts.add;
		this.fb = opts.fb;
		this.err = opts.err;
		this.pct = opts.pct;
		this.destroy = opts.destroy;

	}

	apply(game: Game, targ: T, dt: number = 1): boolean {

		if (this.pct && !this.pct.value) {
			return false;
		}
		if (this.if) {
			if (!TestRequire(targ, this.if)) {
				return false;
			}
		}

		// todo: subclass results. etc.
		if (this.spawn) {
			game.spawn(this.spawn, targ.at);
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