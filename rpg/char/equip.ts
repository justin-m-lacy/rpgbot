import { ItemType } from 'rpg/items/types';
import { Item } from '../items/item';
import { HumanSlot, HumanSlots, THanded, Wearable } from "../items/wearable";

const MaxSlots: { [key: string]: number | undefined } = {
	neck: 3,
	fingers: 4
};

export class Equip {

	readonly slots: HumanSlots = {
		head: null,
		hands: null,
		back: null,
		waist: null,
		neck: null,
		fingers: null,
		chest: null,
		legs: null,
		shins: null,
		feet: null,
		left: null,
		right: null
	};

	constructor() {
	}

	get(slot: HumanSlot) {
		return this.slots[slot] ?? null;
	}

	/**
	 *
	 * @param it
	 */
	remove(it: Wearable) {

		if (it.type === ItemType.Weapon) return this.removeWeap(it);

		const cur = this.slots[it.slot];

		if (Array.isArray(cur)) {

			for (let i = cur.length - 1; i >= 0; i--) {

				if (cur[i] == it) {
					cur.splice(i, 1);
					return true;
				}

			}

		} else {

			if (cur == it) {
				this.slots[it.slot] = null;
				return true;
			}

		}

		return false;

	}

	/**
	 * Remove item from slot and return it.
	 * @param slot
	 */
	removeSlot(slot: HumanSlot) {

		let it = this.slots[slot];
		if (!it) return;

		if (Array.isArray(it)) {

			if (!it.length) return;
			it = it.shift()!;

		} else {
			this.slots[slot] = null;
		}

		return it;

	}

	removeWeap(it: Wearable) {

		if (this.slots.right == it) this.slots.right = null;
		else if (this.slots.left == it) this.slots.left = null;

		return it;

	}

	canEquip(it: Item): it is Wearable {
		return it instanceof Wearable && it.slot && Object.hasOwn(this.slots, it.slot);
	}

	equipHand(it: THanded) {

		const right = this.slots.right;
		const left = this.slots.left;

		if (it.hands === 2) {

			this.slots.right = it;
			this.slots.left = null;

			if (right === null) return left;
			if (left === null) return right;
			return [left, right];

		} else {

			if (right === null) {

				this.slots.right = it;
				if (left !== null && (left as THanded).hands === 2) {
					this.slots.left = null;
					return left;
				}

			} else if (left === null) {

				this.slots.left = it;
				if (right !== null && (right as THanded).hands === 2) {
					this.slots.right = null;
					return right;
				}

			} else {

				// can't both be two-handed.
				this.slots.right = it;
				this.slots.left = right;

				return left;

			}
			return null;

		}

	}

	/**
	 *
	 * @param slot
	 * @param it
	 * @returns error string if slot does not exist, null if equip
	 * successful, old item if item replaces previous.
	 * todo: remove return type string.
	 */
	equip(it: Wearable): null | Wearable | Wearable[] {

		if (it.slot == 'hands' || it.slot == 'left' || it.slot == 'right') return this.equipHand(it as THanded);

		const slot = it.slot;

		let cur = this.slots[slot];
		if (Array.isArray(cur)) {

			cur.push(it);
			if (cur.length > (MaxSlots[slot] ?? 1)) cur = cur.shift()!;
			else cur = null;

		} else {

			if (!cur) {
				this.slots[slot] = it;
			} else {

				if (MaxSlots[slot] == null || MaxSlots[slot] === 1) {
					this.slots[slot] = it;
				} else {
					this.slots[slot] = [cur, it];
					cur = null;	// cur not replaced.
				}

			}

		}

		return cur;

	}

	/**
	 * Remove all items matching predicate, and returns them.
	 * @param p - predicate
	 * @returns
	 */
	removeWhere(p: (v: Item) => boolean) {

		const removed = [];

		let k: HumanSlot;
		for (k in this.slots) {

			const v = this.slots[k];
			if (v === null || v === undefined) continue;

			if (Array.isArray(v)) {

				for (let i = v.length - 1; i >= 0; i--) {

					if (p(v[i])) {
						removed.push(v.splice(i, 1)[0]);
					}

				}

			} else if (p(v)) {

				this.slots[k] = null;
				removed.push(v);

			}

		}

		return removed;

	}

	forEach(f: (v: Wearable | null) => any) {


		let k: HumanSlot
		for (k in this.slots) {

			const v = this.slots[k];
			if (Array.isArray(v)) {

				for (let i = v.length - 1; i >= 0; i--) f(v[i]);

			} else f(v);

		}

	}

	* slotNames() {
		for (let k in this.slots) yield k;
	}

	* items() {

		let k: HumanSlot;
		for (k in this.slots) {
			const it = this.slots[k];
			if (it) yield it;
		}

	}

}