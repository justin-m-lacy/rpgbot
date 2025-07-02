import { Inventory } from "rpg/inventory";
import { Viewable } from "rpg/values/types";

/**
 * @returns list of all items in inventory.
 **/
export const ItemMenu = (inv: Inventory) => {

	const len = inv.items.length;
	if (len === 0) return '';

	return inv.items.map((v, i) =>
		(i + 1) + ') ' + v.toString() + (v.attach ? '\t[img]' : '')
	).join('\n');

}

/**
 * @param a - get text for list of items.
 */
export const ItemList = (a: Inventory | Viewable[]) => {

	if (!Array.isArray(a)) a = a.items;
	if (a.length === 0) return 'nothing';
	return a.map(it => it.name + (it.attach ? '\t[img]' : '')).join(',');

}
