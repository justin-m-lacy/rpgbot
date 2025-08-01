import { Char } from "rpg/char/char";
import { ItemList } from "rpg/display/items";
import { HumanSlot } from "rpg/items/wearable";

// Icons to use for slot display.
/*const SlotIcons = {
	head: '',
	left: '✋',
	right: '✋',
}*/

export const EquipList = (char: Char) => {
	const eq = char.equip;

	let list = '';

	let cur, slot: HumanSlot;
	for (slot in eq.slots) {

		list += '\n' + slot + ': ';

		cur = eq.slots[slot];
		if (cur == null) {
			list += 'nothing'
		} else if (Array.isArray(cur)) {
			list += ItemList(cur);
		} else {
			list += cur.name;
		}

	}

	return list;
}