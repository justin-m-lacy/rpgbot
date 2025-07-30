import Epitaphs from 'data/items/epitaphs.json';
import { TActor } from 'rpg/char/mobs';
import { Game } from 'rpg/game';
import { ItemProto, ItemType } from 'rpg/items/types';
import { Char } from "../char/char";
import { genderfy } from '../social/gender';
import { Item, TStacker } from "./item";

export class Grave extends Item implements TStacker {

	/**
	 *
	 * @param char
	 * @param slayer
	 */
	static MakeGrave(char: Char, slayer?: TActor | string) {

		if (slayer && typeof slayer == 'object') slayer = slayer.name;
		return new Grave(undefined, char.name, slayer, Grave.GetEpitaph(char, slayer));

	}

	static Decode(json: ItemProto & { n?: number, char: string, slayer?: string, epitaph?: string }) {

		const p = new Grave(json.id, json.char, json.slayer, json.epitaph);

		p.count = json.n ?? 1;

		Item.SetProtoData(json, p);

		return p;

	}

	static GetEpitaph(char: Char, slayer?: string) {

		if (!slayer) {
			return `Here lies ${char}. Died of unknown causes.`;
		}
		const ep = Epitaphs[Math.floor(Math.random() * Epitaphs.length)];

		return genderfy(char.sex, ep.replace(/%c/g, char.name).replace(/%k/g, slayer));

	}

	toJSON() {

		const s = super.toJSON() as any;

		s.desc = undefined;
		s.name = undefined;

		s.char = this.char;
		s.epitaph = this.epitaph;
		s.slayer = this.slayer;

		if (this.count !== 1) {
			s.n = this.count;
		}

		return s;

	}

	count: number = 1;
	get stack() { return true; }
	canStack(it: Grave) {
		return it.char == this.char && it.slayer == this.slayer && it.epitaph == this.epitaph && it.inscrip == this.inscrip;
	}

	private readonly char: string;
	private readonly slayer: string;

	private epitaph: string;

	constructor(id: string | undefined,
		char: Char | string,
		slayer?: string,
		epitaph?: string) {

		super({
			id,
			name: `${char}'s Gravestone`,
			desc: `Here lies ${char}, slain by ${slayer}.`,
			type: ItemType.Grave
		});

		this.char = typeof char === 'string' ? char : char?.name;
		this.slayer = slayer ?? 'none';
		this.epitaph = epitaph ?? '';

	}

	onTake(game: Game, char: Char): Item | null {

		if (Math.random() < 0.2) {
			game.spawn(["zombie"], char.at);
		}

		return this;

	}

	getDetails(char?: Char, imgTag = true) {
		return (super.getDetails(char) + '\n' + this.epitaph) +
			(char?.id == this.char ? 'Oh god... Is that.. me?' : '');
	}

}