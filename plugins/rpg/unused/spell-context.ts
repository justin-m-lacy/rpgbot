import type Game from "@/game";
import type World from "plugins/rpg/world/world";


export class SpellContext {

	private readonly world: World;
	private readonly game: Game;

	constructor(game: Game) {

		this.game = game;
		this.world = game.world;

	}

	cast(spell: any) {
	}

};