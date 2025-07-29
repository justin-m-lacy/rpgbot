
export type TOnDrop = {

	/**
	 * npcs to spawn on drop.
	 */
	spawn?: string[],

	/**
	 * destroy object after effect.
	 */
	destroy?: boolean,

	//exec(game: Game, char: Char): boolean;

}


export const ParseOnDrop = (json: any): TOnDrop | undefined => {


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