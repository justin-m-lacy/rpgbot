
export type TSpawnOpts = string | {
	kind: string;
	level?: number;
	biome?: string;
} | { kind?: string, level: number, biome?: string }


export const ParseSpawnOpts = (s: any): TSpawnOpts[] | undefined => {

	if (Array.isArray(s)) {
		const res: TSpawnOpts[] = [];
		for (let i = 0; i < s.length; i++) {
			if (typeof s[i] === 'string' || typeof s[i] === 'object') res.push(s[i] as TSpawnOpts);
		}
		return res;
	}
	if (typeof s == 'string') return s.split(',');
	if (typeof s == 'object') return [s as TSpawnOpts];

}