import { Maxable } from "plugins/rpg/values/maxable";
import { Simple } from "plugins/rpg/values/simple";
import type { Numeric } from "plugins/rpg/values/types";

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

export const pointStats = ['str', 'con', 'dex', 'int', 'wis', 'char', 'armor'];

export type StatName = 'evil' | 'str' | 'con' | 'dex' | 'int' | 'wis' | 'cha' | 'armor' | 'level' | 'dr' | 'age';

export type StatKey = keyof StatBlock;

export interface IStatBlock {

	evil: number;

	hp: Maxable;
	mp: Maxable;

	level: Numeric;

	armor: Numeric;

	// damage reduction.
	dr: Numeric;

	resists: Record<string, Numeric>;

	str: Numeric;
	con: Numeric;
	dex: Numeric;
	int: Numeric;
	wis: Numeric;
	cha: Numeric;

}

export class StatBlock implements IStatBlock {

	get evil() { return this._evil.value; }
	set evil(v) { this._evil.value = v; }

	readonly hp = new Maxable('hp');
	readonly mp = new Maxable('mp');
	readonly str = new Maxable('str');
	readonly con = new Maxable('str');
	readonly dex = new Maxable('str');
	readonly wis = new Maxable('str');
	readonly cha = new Maxable('str');
	readonly int = new Maxable('int');

	//----
	private readonly _evil: Simple = new Simple('evil');
	readonly level: Simple = new Simple('level');

	readonly armor: Simple = new Simple('armor');

	// damage reduction.
	readonly dr: Simple = new Simple('dr');
	readonly resists: Record<string, Numeric> = {};

	constructor() { }

	static FromJSON(json: any) {

		const stats = new StatBlock();

		for (const k in json) {
			if (stats.hasOwnProperty(k)) stats[k as StatKey] = json[k];
		}

		if (!json.evil) stats.evil = 0;

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

			evil: this._evil.toJSON(),

			dr: this.dr.toJSON(),
			resist: this.resists

		};

	}

	/**
	 * Gets a modifier for a base stat.
	 * @param {*} stat 
	 */
	getModifier(stat: string) {
		const val = stat in this ? +this[stat as StatKey] : 0;
		return Math.floor(((val ?? 0) - 10) / 2);
	}

	addMaxHp(amt: number) {
		this.hp.max.add(amt);
		this.hp.value += amt;
	}

}