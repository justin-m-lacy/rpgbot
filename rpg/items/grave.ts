import { randomUUID } from 'crypto';
import { Monster } from 'rpg/monster/monster';
import { ItemData, ItemType } from 'rpg/parsers/items';
import { Char } from "../char/char";
import { genderfy } from '../social/gender';
import { Item } from "./item";

export class Grave extends Item {

	static _Epitaphs?: string[];

	/**
	 *
	 * @param char
	 * @param slayer
	 */
	static MakeGrave(char: Char, slayer: Char | Monster) {
		return new Grave(randomUUID(), char.name, slayer.name, Grave.GetEpitaph(char, slayer));
	}

	static Decode(json: ItemData & { char: string, slayer?: string, epitaph?: string }) {

		const p = new Grave(json.id, json.char, json.slayer, json.epitaph);

		Item.InitData(json, p);

		return p;

	}

	static GetEpitaph(char: Char, killer: Char | Monster) {

		const eps = this._Epitaphs ?? (this._Epitaphs = require('../data/items/epitaphs.json'));
		const ep = eps[Math.floor(Math.random() * eps.length)];

		return genderfy(char.sex, ep.replace(/%c/g, char.name).replace(/%k/g, killer.name));

	}

	toJSON() {

		const s = super.toJSON() as any;

		s.desc = undefined;
		s.name = undefined;

		s.char = this.char;
		s.epitaph = this.epitaph;
		s.slayer = this.slayer;

		return s;

	}


	private readonly char: string;
	private readonly slayer: string;

	private epitaph: string;

	constructor(id: string,
		char: Char | string,
		slayer: Char | string = 'nothing',
		epitaph?: string) {

		super(id, {
			name: `${char}'s Gravestone`,
			desc: `Here lies ${char}, slain by ${slayer}.`,
			type: ItemType.Grave
		});

		this.char = typeof char === 'string' ? char : char?.name;
		this.slayer = typeof slayer === 'string' ? slayer : slayer?.name;
		this.epitaph = epitaph ?? '';

	}

	getDetails(imgTag = true) {
		return super.getDetails() + '\n' + this.epitaph;
	}

}