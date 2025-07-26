import { StatusFlag } from 'rpg/char/states';
import { TargetFlags } from 'rpg/combat/targets';
import { Item } from 'rpg/items/item';
import type { IMod } from 'rpg/values/imod';
import type { Path } from 'rpg/values/paths';
import type { Numeric } from 'rpg/values/types';
import { ProtoDot } from './dots.js';

export class Spell extends Item {

	/**
	 * type of damage.
	 */
	kind: string;

	duration: number = 0;
	target: TargetFlags;
	dmg?: Numeric;

	dot?: ProtoDot;
	mods?: Path<IMod>;

	cost?: Path<Numeric>;
	cure?: StatusFlag;

	summon?: string[];

	constructor(data: {
		id: string;
		name?: string;
		dmg?: Numeric;
		mods?: Path<IMod> | null,
		dot?: ProtoDot | null,
		cost?: Path<Numeric>,
		cure?: StatusFlag,
		time?: number,
		kind?: string,
		target?: TargetFlags,
		summon?: string[]
	}) {

		super(data);

		this.kind = data.kind ?? 'arcane';

		this.summon = data.summon;
		this.cure = data.cure;
		this.cost = data.cost;
		this.dot = data.dot ?? undefined;
		this.mods = data.mods ?? undefined;
		this.duration = data.time ?? 0;
		this.target = data.target ?? TargetFlags.any;

		this.dmg = data.dmg;

	}

}