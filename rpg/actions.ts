import { type Char } from 'rpg/char/char';
import { type CharState } from 'rpg/char/states';
import { type Game } from 'rpg/game';
import { Talent } from 'rpg/talents/talent';

type BaseAction = {

	// whether the action advances the character dots/ticks.
	tick: boolean;

	// whether action is copied by entire party.
	party?: boolean;

	// rest recovery factor.
	rest?: number;
}

type FuncAction = BaseAction & { exec: Function }
type TalentAction = BaseAction & { talent: Talent }

export type TGameAction = TalentAction | FuncAction;

/**
 * Actions blocked by each character state.
*/
export const Blockers: Partial<{ [P in CharState]: Record<string, number> }> = {
	dead: {
		attack: 1,
		brew: 1,
		cast: 1,
		destroy: 1,
		drop: 1,
		eat: 1,
		equip: 1,
		cook: 1,
		craft: 1,
		give: 1,
		heal: 1,
		hike: 1,
		map: 1,
		quaff: 1,
		scout: 1,
		sell: 1,
		steal: 1,
		take: 1,
		unequip: 1,

	}
};

type TalentParams<A extends TalentAction> = A['talent']['exec'] extends ((game: Game, char: Char, ...args: infer P) => boolean | Promise<boolean>) ? P : never;

type FuncParams<A extends FuncAction> = A['exec'] extends (char: Char, ...args: infer P) => any ? P : never;

export type ActParams<A> =
	A extends FuncAction ? FuncParams<A> :
	(A extends TalentAction ? TalentParams<A> : never);