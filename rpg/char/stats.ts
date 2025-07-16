import type { IMod } from "rpg/values/imod";
import { Maxable } from "rpg/values/maxable";
import { Simple } from "rpg/values/simple";
import type { Numeric } from "rpg/values/types";

export const getEvil = (evil: number) => {

	if (evil >= 25) {

		if (evil > 1500) return 'diabolical';
		if (evil > 750) return 'malevolent';
		if (evil > 300) return 'evil';
		if (evil > 100) return 'wicked';
		return 'mean';

	} else if (evil <= -25) {

		if (evil < -1500) return 'righteous';
		if (evil < -750) return 'virtuous';
		if (evil < -300) return 'good';
		if (evil < -100) return 'nice';

		return 'polite';

	} else return 'neutral';

	//if ( evil < -30 ) return 'diabolical'
	//['mean','wicked', 'evil', 'diabolical'],
	//['nice', 'good', '', 'righteous'];

};

export const StatIds = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export type StatName = typeof StatIds[number];

export type StatMod = Partial<{
	[K in keyof IStatValues]: IMod
}>

export interface IStatValues {

	hp: Numeric;
	mp: Numeric;

	level: Numeric;

	armor: Numeric;

	// damage reduction.
	dr: Numeric;

	str: Numeric;
	con: Numeric;
	dex: Numeric;
	int: Numeric;
	wis: Numeric;
	cha: Numeric;

}

export type StatKey = keyof IStatValues;

export class StatBlock {

	readonly hp = new Maxable('hp');
	readonly mp = new Maxable('mp');
	readonly str = new Simple('str');
	readonly con = new Simple('con');
	readonly dex = new Simple('dex');
	readonly int = new Simple('int');
	readonly wis = new Simple('wis');
	readonly cha = new Simple('cha');

	readonly level: Simple = new Simple('level');

	readonly armor: Simple = new Simple('armor');

	// damage reduction.
	readonly dr: Simple = new Simple('dr');

	readonly age: Simple = new Simple('age');
	gold: number = 0;

	constructor() { }

	static Decode(json: any) {

		const stats = new StatBlock();

		for (const k in stats) {
			stats[k as StatKey].setTo(json[k]);
		}

		return stats;

	}

	/// TODO: damage reduction.
	/*getDR(type: string) {
		if (!this._dr) return 0;
		return this._dr[type] || 0;
	}*/

	toJSON() {

		return {

			hp: this.hp.toJSON(),
			mp: this.mp.toJSON(),

			level: this.level.toJSON(),
			armor: this.armor.toJSON(),

			str: this.str.toJSON(),
			con: this.con.toJSON(),
			dex: this.dex.toJSON(),
			int: this.int.toJSON(),
			wis: this.wis.toJSON(),
			cha: this.cha.toJSON(),

			dr: this.dr.toJSON(),

		};

	}

	/**
	 * Gets a modifier for a base stat.
	 * @param stat 
	 */
	getModifier(stat: string) {
		return (
			((this[stat as StatKey]?.valueOf() ?? 10) - 10) / 2
		);
	}

	addMaxHp(amt: number) {
		this.hp.max.add(amt);
		this.hp.value += amt;
	}

}