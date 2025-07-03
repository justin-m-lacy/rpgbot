import { LifeState } from 'rpg/char/actor';
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

	// action allows resting/hp recovery.
	rest?: boolean;

}

export const GameActions = {

	attack: {

		tick: true,

		exec: Game.prototype.attack,

	},
	brew: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	cast: {

		tick: true,
		exec: Game.prototype.attack,

	},
	cook: {
		tick: true,
		exec: Game.prototype.cook,
		rest: true,
	},
	craft: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	destroy: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	drop: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	eat: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	equip: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	give: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	hike: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	inscribe: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	map: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	quaff: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	revive: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	scout: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	sell: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	steal: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	take: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	track: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
	unequip: {
		tick: true,
		exec: Game.prototype.drop,
		rest: true,
	},
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
