import type { Char } from 'rpg/char/char';
import { ActTarget } from 'rpg/combat/targets';
import { Item } from 'rpg/items/item';
import type { IMod, ModBlock } from 'rpg/values/imod';
import type { Path } from 'rpg/values/paths';
import type { ISimple, TValue } from 'rpg/values/types';
import { ProtoEffect } from './effects';

export class Spell extends Item {

	static Decode(json: any) {

		const spell = new Spell(json);

		Item.InitData(json, spell);

		return spell;

	}


	duration: number = 0;
	target: ActTarget = ActTarget.none;
	dmg?: ISimple;


	effects?: ProtoEffect[];
	mods?: ModBlock<Char>;


	constructor(data: {
		id: string,
		name?: string,
		mods?: Path<IMod> | null,
		dot?: Path<TValue> | null,
		time?: number
	}) {

		super(data.id, data);
	}

	cast(src: any, target: any) {
	}

}