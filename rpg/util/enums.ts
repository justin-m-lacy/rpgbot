
/**
 * Reverse record of EnumValues->T
 * into Enum Strings -> T
 * used to save enum strings instead of bit values.
 * @param E 
 * @param vals 
 * @returns 
 */
export const ReverseMap = <Enum extends Record<string | number, string | number>, T extends any>(
	E: Enum,
	vals: Partial<Record<Enum[keyof Enum], T>>
) => {

	const rev: Partial<{
		[K in keyof Enum]: T;
	}> = {};

	let k: keyof typeof vals;
	for (k in vals) {

		// reverse enum map;
		const s = E[vals[k] as keyof Enum];
		console.log(`rev enum: ${k}->${s}`);

		rev[s] = vals[k]!;
	}

	return rev;

}