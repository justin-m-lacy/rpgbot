import type { IMod } from "rpg/values/imod";
import { Maxable } from "rpg/values/maxable";
import { Simple } from "rpg/values/simple";
import type { Numeric } from "rpg/values/types";

export const getEvil = (evil: number) => {

	if (evil >= 5) {

		if (evil > 40) return 'diabolical';
		if (evil > 30) return 'malevolent';
		if (evil > 20) return 'evil';
		if (evil > 10) return 'wicked';
		return 'mean';

	} else if (evil <= -5) {

		if (evil < -40) return 'righteous';
		if (evil < -30) return 'virtuous';
		if (evil < -20) return 'good';
		if (evil < -10) return 'nice';

		return 'polite';

	} else return 'neutral';

	//if ( evil < -30 ) return 'diabolical'
	//['mean','wicked', 'evil', 'diabolical'],
	//['nice', 'good', '', 'righteous'];

};

export const StatIds = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const PointStats = ['str', 'con', 'dex', 'int', 'wis', 'char', 'armor'];

export type StatName = 'evil' | 'str' | 'con' | 'dex' | 'int' | 'wis' | 'cha' | 'armor' | 'level' | 'dr' | 'age';

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
	readonly str = new Maxable('str');
	readonly con = new Maxable('con');
	readonly dex = new Maxable('dex');
	readonly int = new Maxable('int');
	readonly wis = new Maxable('wis');
	readonly cha = new Maxable('cha');

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