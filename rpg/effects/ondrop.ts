export type TItemEffect = {

	/**
	 * npcs to spawn on drop.
	 */
	spawn?: string[];

	/**
	 * destroy object after effect.
	 */
	destroy?: boolean;

	fb?: string;

	//exec(game: Game, char: Char): boolean;

}


export const ParseOnDrop = (json: any): TItemEffect | undefined => {


	if (typeof json !== 'object') return undefined;

	return {

		spawn: ParseSpawn(json.spawn),
		destroy: json.destroy ?? false

	}

}

const ParseSpawn = (s: any) => {

	if (Array.isArray(s)) return s;
	if (typeof s == 'string') return s.split(',');
	return undefined;

}