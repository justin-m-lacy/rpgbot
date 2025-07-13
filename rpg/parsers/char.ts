import { Char } from 'rpg/char/char';
import { Equip, type HumanSlots } from 'rpg/char/equip';
import { CharState, StatusFlag } from 'rpg/char/states';
import { Game } from 'rpg/game';
import { Inventory } from 'rpg/inventory';
import type { HumanSlot, Wearable } from 'rpg/items/wearable';
import { Dot } from 'rpg/magic/dots';
import { DecodeItem } from 'rpg/parsers/items';
import { BadTypeError, NullDataError } from 'rpg/util/errors';
import { Coord, IsCoord } from 'rpg/world/coord';
import { GetClass, GetRace } from './parse-class';


export const ReviveChar = (game: Game, json: any) => {

	if (!json) throw new NullDataError();

	const char = new Char(
		json.name,
		{
			game: game,
			race: GetRace(json.race)!,
			cls: GetClass(json.cls)!,
			owner: json.owner
		});

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

	if (IsCoord(json.at)) {
		char.at.setTo(json.at);
	} else if (IsCoord(json.loc)) {
		/// @deprecated legacy. remove.
		char.at.setTo(json.loc)
	}

	if (typeof json.flags === 'number') {
		char.flags.setTo(json.flags);
		if (json.flags & StatusFlag.alive) char.state = CharState.Alive;
		else { char.state = CharState.Dead }
	} else {
		char.state = CharState.Alive;
	}

	char.statPoints = json.statPoints || char.stats.level;
	char.spentPoints = json.spentPoints || 0;

	if (json.inv) Inventory.Decode(json.inv, DecodeItem, char.inv);

	// SET AFTER BASE STATS.
	if (Array.isArray(json.dots)) {
		let a = json.dots;
		for (let i = a.length - 1; i >= 0; i--) {

			const dot = Dot.Decode(a[i]);
			if (dot) {
				char.addDot(dot, dot.maker);
			}

		}
	}

	if (json.equip) char.setEquip(
		ReviveEquip(json.equip)
	);

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

			dest[k] = wot.map(v => DecodeItem(v) as Wearable);

		} else dest[k] = DecodeItem(wot) as Wearable;

	}

	return e;

}