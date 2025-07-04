import { ActTarget } from 'rpg/combat/targets';
import { Item } from 'rpg/items/item';
import type { IMod } from 'rpg/values/imod';
import type { Path } from 'rpg/values/paths';
import type { ISimple } from 'rpg/values/types';
import { ProtoEffect } from './effects';

export class Spell extends Item {

	static Decode(json: any) {

		const spell = new Spell(json);

		Item.InitData(json, spell);

		return spell;

	}


	duration: number = 0;
	target: ActTarget;
	dmg?: ISimple;

	dot?: ProtoEffect;
	mods?: Path<IMod>;


	constructor(data: {
		id: string;
		name?: string;
		dmg?: ISimple;
		mods?: Path<IMod> | null,
		dot?: ProtoEffect | null,
		time?: number,
		target?: ActTarget
	}) {

		super(data.id, data);

		this.dot = data.dot ?? undefined;
		this.mods = data.mods ?? undefined;
		this.duration = data.time ?? 0;
		this.target = data.target ?? ActTarget.any;

		this.dmg = data.dmg;

	}

	cast(src: any, target: any) {
	}

}