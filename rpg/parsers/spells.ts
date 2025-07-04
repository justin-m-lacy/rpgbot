import { ParseDotType, RawEffect } from 'rpg/magic/effects';
import { Spell } from 'rpg/magic/spell';
import { ParseMods } from 'rpg/parsers/mods';

type RawSpell = {
	id: string;
	name?: string;
	level?: number;
	cost?: Record<string, number>;
	dot?: RawEffect;
	mods?: Record<string, any>;
	time?: number
} &
	typeof import('../data/magic/spells.json', { assert: { type: 'json' } })[number];

// effect types. loading at bottom.
export const Spells: Partial<{ [id: string]: Spell }> = {};

const ParseSpell = (raw: RawSpell) => {

	console.log(`parse spell: ${raw.id}`);

	return new Spell({
		id: raw.id,
		name: raw.name,
		mods: raw.mods ? ParseMods(raw.mods, raw.id,) : null,
		dot: raw.dot ? ParseDotType(raw.dot) : null,
		time: raw.time,
	});


}

export const LoadSpells = async () => {

	const spellDatas = (await import(
		'../data/magic/spells.json', { assert: { type: 'json' } }
	)).default;
	for (let i = spellDatas.length - 1; i >= 0; i--) {
		Spells[spellDatas[i].id] = ParseSpell(spellDatas[i] as any);
	}

}


export const GetSpell = (s: string) => Spells[s];