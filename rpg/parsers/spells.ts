import { Spell } from 'rpg/magic/spell';
import { ParseMods } from 'rpg/parsers/mods';
import { ParseValues } from 'rpg/parsers/values';

type RawSpell = {
	id: string;
	name?: string;
	level?: number;
	cost?: Record<string, number>;
	dot?: Record<string, any>;
	mods?: Record<string, any>;
	time?: number
} &
	typeof import('../data/magic/spells.json', { assert: { type: 'json' } })[number];

// effect types. loading at bottom.
export const Spells: Partial<{ [id: string]: Spell }> = {};

const parseSpell = (raw: RawSpell) => {

	console.log(`parse spell: ${raw.id}`);

	return new Spell({
		id: raw.id,
		name: raw.name,
		mods: raw.mods ? ParseMods(raw.mods, raw.id,) : null,
		dot: raw.dot ? ParseValues(raw.id, 'dot', raw.dot) : null,
		time: raw.time,
	});


}

export const LoadSpells = async () => {

	const spellDatas = (await import(
		'../data/magic/spells.json', { assert: { type: 'json' } }
	)).default;
	for (let i = spellDatas.length - 1; i >= 0; i--) {
		Spells[spellDatas[i].id] = parseSpell(spellDatas[i] as any);
	}

}


export const GetSpell = (s: string) => Spells[s];