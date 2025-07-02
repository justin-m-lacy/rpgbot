import type { Char } from 'rpg/char/char';
import { ActTarget } from 'rpg/combat/targets';
import type { IMod, ModBlock } from 'rpg/values/imod';
import type { Path } from 'rpg/values/paths';
import type { ISimple, TValue } from 'rpg/values/types';
import { ProtoEffect } from './effects';

export class Spell {

	get duration() { return this._duration; }

	readonly id: string;
	readonly name: string;
	private _duration: number = 0;
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
	}, name?: string) {

		this.id = data.id;
		this.name = data.name ?? data.id;
	}

	cast(src: any, target: any) {
	}

}