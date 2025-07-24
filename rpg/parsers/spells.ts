import { Item } from 'rpg/items/item';
import { ParseDotType, RawEffect } from 'rpg/magic/dots';
import { Spell } from 'rpg/magic/spell';
import { ParseMods } from 'rpg/parsers/mods';
import { ParseValue } from 'rpg/parsers/values';
import { randElm } from '../util/array';

type RawSpell = {
	id: string;
	name?: string;
	level?: number;
	cost?: Record<string, number>;
	dmg?: string | number,
	dot?: RawEffect;
	mods?: Record<string, any>;
	time?: number
} &
	typeof import('data/magic/spells.json', { assert: { type: 'json' } })[number];

// effect types. loading at bottom.
const Spells: Record<string, Spell> = {};

const byLevel: Record<number, Spell[]> = {};

/**
 * Decode spell from stored data.
 * should rarely be used since spells are coded in json.
 * @param json 
 * @returns 
 */
export const DecodeSpell = (json: any) => {

	const spell = ParseSpell(json);

	Item.SetProtoData(json, spell);

	return spell;

}

export const ParseSpell = (raw: RawSpell) => {

	return new Spell({
		id: raw.id,
		name: raw.name ?? raw.id,
		dmg: ParseValue('dmg', raw.dmg),
		mods: raw.mods ? ParseMods(raw.mods, raw.id,) : null,
		dot: raw.dot ? ParseDotType(raw.dot, raw) : null,
		time: raw.time,
		summon: raw.summon
	});


}

export const LoadSpells = async () => {

	const spellDatas = (await import(
		'data/magic/spells.json', { assert: { type: 'json' } }
	)).default;
	for (let i = spellDatas.length - 1; i >= 0; i--) {

		const sp = Spells[spellDatas[i].id] = ParseSpell(spellDatas[i] as any);
		Spells[sp.name.toLowerCase()] = sp;
		(byLevel[sp.level] ??= []).push(sp);

	}

}


export const GetSpell = (s: string) => Spells[s.toLowerCase()];
export const RandSpell = (lvl: number) => {
	return randElm(byLevel[lvl]);
}