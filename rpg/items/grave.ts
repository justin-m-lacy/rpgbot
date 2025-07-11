import { ItemData, ItemType } from 'rpg/items/types';
import { TActor } from 'rpg/monster/mobs';
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
	static MakeGrave(char: Char, slayer?: TActor | string) {

		if (slayer && typeof slayer == 'object') slayer = slayer.name;
		return new Grave(undefined, char.name, slayer, Grave.GetEpitaph(char, slayer));

	}

	static Decode(json: ItemData & { char: string, slayer?: string, epitaph?: string }) {

		const p = new Grave(json.id, json.char, json.slayer, json.epitaph);

		Item.InitData(json, p);

		return p;

	}

	static GetEpitaph(char: Char, slayer?: string) {

		if (!slayer) {
			return `Here lies ${char}. Died of unknown causes.`;
		}

		const eps = this._Epitaphs ?? (this._Epitaphs = require('data/items/epitaphs.json'));
		const ep = eps[Math.floor(Math.random() * eps.length)];

		return genderfy(char.sex, ep.replace(/%c/g, char.name).replace(/%k/g, slayer));

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

	constructor(id: string | undefined,
		char: Char | string,
		slayer?: string,
		epitaph?: string) {

		super(id, {
			name: `${char}'s Gravestone`,
			desc: `Here lies ${char}, slain by ${slayer}.`,
			type: ItemType.Grave
		});

		this.char = typeof char === 'string' ? char : char?.name;
		this.slayer = slayer ?? 'none';
		this.epitaph = epitaph ?? '';

	}

	getDetails(char?: Char, imgTag = true) {
		return (super.getDetails(char) + '\n' + this.epitaph) +
			(char?.id == this.char ? 'Oh god... Is that.. me?' : '');
	}

}