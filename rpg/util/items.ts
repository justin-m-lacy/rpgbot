import type { ItemIndex } from 'rpg/items/container';
import { Item } from 'rpg/items/item';
import { IsInt } from 'rpg/util/parse';

export const FindId = <T extends Item>(a: T[], id: string) => {

	const lower = id.toLowerCase();
	for (let i = a.length - 1; i >= 0; i--) {

		const it = a[i];
		if (!it) continue;
		if (it.id === lower) return a[i];
		else if (it.name && it.name.toLowerCase() === lower) return a[i];

	}
	return null;
}

/**
 * Return named item from array.
 * @param  ind
* @returns  Item found, or null on failure.
*/
export const FindIndex = <T extends Item>(a: T[], ind?: ItemIndex): T | null => {

	/// 0 is also not allowed because indices are 1-based.
	if (!ind) return null;

	if (typeof ind === 'string') {

		if (!IsInt(ind)) {
			return FindId(a, ind);
		} else {
			ind = parseInt(ind);
		}

	} else if (Number.isNaN(ind)) {
		/// initial index passed was NaN.
		return null;
	}


	ind--;
	return a[ind];

}