import { Game } from "rpg/game";
import { Brew } from "rpg/talents/brew";
import { Cook } from "rpg/talents/cook";
import { Hike } from "rpg/talents/hike";
import { Revive } from "rpg/talents/revive";
import { Scout } from "rpg/talents/scout";
import { Sneak } from "rpg/talents/sneak";
import { Steal } from "rpg/talents/steal";
import { Track } from "rpg/talents/track";

/// TODO: make these dynamically added to game act list.
export const GameActions = {

	attack: {

		tick: true,
		exec: Game.prototype.attack,
		rest: 0

	},
	brew: {
		tick: true,
		talent: Brew,
		rest: 0.8,
	},
	buy: {
		tick: true,
		exec: Game.prototype.buy,
		rest: 0.9
	},
	cast: {

		tick: true,
		exec: Game.prototype.cast,
		rest: 0
	},
	cook: {
		tick: true,
		talent: Cook,
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
		talent: Hike,
		rest: 0
	},
	hide: {
		tick: true,
		talent: Sneak,
		rest: 0.1
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
		talent: Revive,
		rest: 1,
	},
	scout: {
		tick: true,
		talent: Scout,
		rest: 0
	},
	sell: {
		tick: true,
		exec: Game.prototype.sell,
		rest: 0.9
	},
	steal: {
		tick: true,
		talent: Steal,
		rest: 0.2
	},
	take: {
		tick: true,
		exec: Game.prototype.take,
		rest: 0.9
	},
	track: {
		tick: true,
		exec: Track,
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