import { Inventory } from "rpg/inventory";
import { Viewable } from "rpg/values/types";

/**
 * @returns list of all items in inventory.
 **/
export const ItemMenu = (inv: Inventory) => {

	if (inv.items.length === 0) return '';

	return inv.items.map((v, i) =>
		(i + 1) + ') ' + v.toString() + (v.embed ? '\t[img]' : '')
	).join('\n');

}

/**
 * @returns list of all items in inventory.
 **/
export const MenuList = (items: string[]) => {

	if (items.length === 0) return 'Nothing';

	return items.map((v, i) =>
		(i + 1) + ') ' + v.toString()
	).join('\n');

}

/**
 * @param a - get text for list of items.
 */
export const ItemList = (a: Inventory | Viewable[]) => {

	if (!Array.isArray(a)) a = a.items;
	if (a.length === 0) return 'nothing';
	return a.map(it => it.name + (it.embed ? '\t[img]' : '')).join(',');

}
