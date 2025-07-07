import { type CharState } from 'rpg/char/actor';
import { type Char } from 'rpg/char/char';


export type TGameAction = {

	// whether the action advances the character dots/ticks.
	tick: boolean;

	exec: Function;

	// whether action is copied by entire party.
	party?: boolean;

	// rest recovery factor.
	rest?: number;

}

/**
 * Actions blocked by each character state.
*/
export const Blockers: Partial<{ [P in CharState]: Record<string, number> }> = {
	dead: {
		attack: 1,
		brew: 1,
		destroy: 1,
		drop: 1,
		eat: 1,
		equip: 1,
		cook: 1,
		craft: 1,
		give: 1,
		hike: 1,
		inscribe: 1,
		map: 1,
		quaff: 1,
		revive: 1,
		scout: 1,
		sell: 1,
		steal: 1,
		take: 1,
		track: 1,
		unequip: 1,

	}
};

export type ActionSet = Record<string, TGameAction>;

export type ActParams<S extends TGameAction> =
	S['exec'] extends (char: Char, ...args: infer P) => any ? P : never;