import { LifeState } from 'rpg/char/actor';
import { Char } from 'rpg/char/char';
import { Game } from './game';

/**
 * Game actions.
 */

type TGameAction = {

	// whether the action advances the character dots/ticks.
	tick: boolean;

	exec: Function;

	// whether action is copied by entire party.
	party?: boolean;

	// rest recovery factor.
	rest?: number;

}

export const GameActions = {

	attack: {

		tick: true,
		exec: Game.prototype.attack,

	},
	brew: {
		tick: true,
		exec: Game.prototype.brew,
		rest: 1,
	},
	cast: {

		tick: true,
		exec: Game.prototype.attack,
	},
	cook: {
		tick: true,
		exec: Game.prototype.cook,
		rest: 1,
	},
	craft: {
		tick: true,
		exec: Game.prototype.craft,
		rest: 1,
	},
	destroy: {
		tick: true,
		exec: Game.prototype.destroy,
		rest: 1,
	},
	drop: {
		tick: true,
		exec: Game.prototype.drop,
		rest: 1,
	},
	eat: {
		tick: true,
		exec: Game.prototype.eat,
		rest: 1,
	},
	equip: {
		tick: true,
		exec: Game.prototype.equip,
		rest: 1,
	},
	give: {
		tick: true,
		exec: Game.prototype.give,
		rest: 1,
	},
	hike: {
		tick: true,
		exec: Game.prototype.hike,
	},
	inscribe: {
		tick: true,
		exec: Game.prototype.inscribe,
		rest: 1,
	},
	/*map: {
		tick: true,
		exec: Game.prototype.map,
		rest: 1,
	},*/
	move: {
		tick: true,
		exec: Game.prototype.move,
		rest: 1
	},
	quaff: {
		tick: true,
		exec: Game.prototype.quaff,
		rest: 1,
	},
	rest: {
		tick: true,
		exec: Game.prototype.rest,
		rest: 1
	},
	revive: {
		tick: true,
		exec: Game.prototype.revive,
		rest: 1,
	},
	scout: {
		tick: true,
		exec: Game.prototype.scout,
	},
	sell: {
		tick: true,
		exec: Game.prototype.sell,
	},
	steal: {
		tick: true,
		exec: Game.prototype.steal,
	},
	take: {
		tick: true,
		exec: Game.prototype.take,
	},
	track: {
		tick: true,
		exec: Game.prototype.track,
		rest: 1,
	},
	unequip: {
		tick: true,
		exec: Game.prototype.unequip,
		rest: 1,
	},
	useloc: {
		tick: true,
		exec: Game.prototype.unequip,
		rest: 1
	}
}

/**
 * Actions blocked by each character state.
*/
export const Blockers: Partial<{ [Property in LifeState]: any }> = {
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



export type TGameActions = typeof GameActions;

export type ActParams<T extends keyof TGameActions> =
	TGameActions[T]['exec'] extends (char: Char, ...args: infer P) => any ? P : never;