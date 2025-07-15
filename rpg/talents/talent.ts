import { Char } from "rpg/char/char";
import { Game } from "rpg/game";


type ExecFunc = (game: Game, char: Char, ...params: any[]) => Promise<any>;

export interface Talent {
	id: string,
	stats: string[],
	exec: (game: Game, char: Char, ...params: unknown[]) => boolean | Promise<boolean>,
	name?: string,
	desc?: string,
	trained?: boolean,
}


/** unnecessary.
export class TalentCls {

	readonly id: string;

	readonly name: string;

	// stats that modify the talent.
	readonly stats: string[] = [];

	desc: string = '';

	/// talent can only be used with training.
	trained: boolean = false;

	_exec?: <T extends Talent>(this: T, game: Game, char: Char, ...params: any[]) => Promise<any>;

	constructor(opts: Talent) {

		this.id = opts.id;
		this.name = opts.name ?? opts.id;
		this._exec = opts.exec;

	}

	getModifier(char: Char) {
		let m: number = 0;
		for (let i = this.stats.length - 1; i >= 0; i--) m += char.getModifier(this.stats[i]);
		return m;
	}

	exec(game: Game, char: Char) {

		if (this.trained && !char.hasTalent(this.id)) {
			char.log(`${char.name} does not know how to ${this.name}`);
			return;
		}

	}

}
**/