import { Game } from "rpg/game";

/// TODO: make these dynamically added to game act list.
export const GameActions = {

	attack: {

		tick: true,
		exec: Game.prototype.attack,
		rest: 0

	},
	brew: {
		tick: true,
		exec: Game.prototype.brew,
		rest: 0.8,
	},
	cast: {

		tick: true,
		exec: Game.prototype.cast,
		rest: 0
	},
	cook: {
		tick: true,
		exec: Game.prototype.cook,
		rest: 0.9,
	},
	craft: {
		tick: true,
		exec: Game.prototype.craft,
		rest: 0.5,
	},
	destroy: {
		tick: true,
		exec: Game.prototype.destroy,
		rest: 0.5,
	},
	drop: {
		tick: true,
		exec: Game.prototype.drop,
		rest: 0.8,
	},
	eat: {
		tick: true,
		exec: Game.prototype.eat,
		rest: 1.25,
	},
	equip: {
		tick: true,
		exec: Game.prototype.equip,
		rest: 0.5,
	},
	give: {
		tick: true,
		exec: Game.prototype.give,
		rest: 0.5,
	},
	hike: {
		tick: true,
		exec: Game.prototype.hike,
		rest: 0
	},
	home: {
		tick: true,
		exec: Game.prototype.goHome,
		rest: 0.5
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
		rest: 1.5
	},
	revive: {
		tick: true,
		exec: Game.prototype.revive,
		rest: 1,
	},
	scout: {
		tick: true,
		exec: Game.prototype.scout,
		rest: 0
	},
	sell: {
		tick: true,
		exec: Game.prototype.sell,
		rest: 0.9
	},
	steal: {
		tick: true,
		exec: Game.prototype.steal,
		rest: 0.2
	},
	take: {
		tick: true,
		exec: Game.prototype.take,
		rest: 0.9
	},
	track: {
		tick: true,
		exec: Game.prototype.track,
		rest: 0,
	},
	unequip: {
		tick: true,
		exec: Game.prototype.unequip,
		rest: 0.9,
	},
	useloc: {
		tick: true,
		exec: Game.prototype.useLoc,
		rest: 0.8
	}
}