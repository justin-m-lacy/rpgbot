import { Char } from 'rpg/char/char';
import { Equip, type HumanSlots } from 'rpg/char/equip';
import { BadTypeError, NullDataError } from 'rpg/errors/parsing';
import { Inventory } from 'rpg/inventory';
import { Item } from 'rpg/items/item';
import type { HumanSlot, Wearable } from 'rpg/items/wearable';
import { Effect } from 'rpg/magic/effects';
import { Coord, IsCoord } from 'rpg/world/loc';
import * as ItemGen from '../builders/itemgen';
import { GetClass, GetRace } from './parse-class';


export const ReviveChar = (json: any) => {

	if (!json) throw new NullDataError();

	const char = new Char(
		json.name,
		GetRace(json.race)!,
		GetClass(json.cls)!,
		json.owner);

	char.exp = Math.floor(json.exp) || 0;
	char.evil = json.evil || 0

	char.guild = json.guild;

	if (json.talents && Array.isArray(json.talents)) {
		for (let i = 0; i < json.talents.length; i++) {
			if (typeof json.talents[i] === 'string') {
				char.talents.push(json.talents[i]);
			}
		}
	}

	if (json.history) Object.assign(char.history, json.history);
	if (IsCoord(json.home)) char.home = new Coord(json.home.x, json.home.y);

	if (!json.stats) throw new NullDataError();
	if (typeof json.stats !== 'object') throw new BadTypeError(json.stats, 'object');
	char.setBaseStats(json.stats);

	if (IsCoord(json.loc)) {
		char.loc.setTo(json.loc)
	}

	if (json.state) char.state = json.state;

	char.statPoints = json.statPoints || char.stats.level;
	char.spentPoints = json.spentPoints || 0;

	if (json.inv) Inventory.Revive(json.inv, Item.Revive, char.inv);

	// SET AFTER BASE STATS.
	if (json.effects) {
		let a = json.effects;
		for (let i = a.length - 1; i >= 0; i--) {

			const effect = Effect.Revive(a[i]);
			if (effect) {
				char.addEffect(effect);
			}

		}
	}

	if (json.equip) char.setEquip(ReviveEquip(json.equip));

	char.init();

	return char;

}


export const ReviveEquip = (json: { slots?: Partial<HumanSlots> }) => {

	const e = new Equip();

	if (typeof json !== 'object') throw new BadTypeError(json, 'object');
	const src = json.slots;

	const dest = e.slots;
	if (src == null) return e;

	let k: HumanSlot;
	for (k in src) {

		const wot = src[k];
		if (!wot) continue;
		else if (Array.isArray(wot)) {

			dest[k] = wot.map(v => ItemGen.Revive(v) as Wearable);

		} else dest[k] = ItemGen.Revive(wot) as Wearable;

	}

	return e;

}