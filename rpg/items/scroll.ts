import { Item } from "rpg/items/item";
import { TActor } from "rpg/monster/mobs";
import { GetSpell } from "rpg/parsers/spells";
import { Game } from '../game';
import { ItemType } from './types';

export class Scroll extends Item {

	static Decode(json: any) {

		const s = new Scroll(json.id, json.spell);

		Item.InitData(json);
		s.count = typeof (json.n === 'number') ? json.n : 1;

		return s;

	}

	toJSON() {

		const data = super.toJSON();
		data.spell = this.spell;
		if (this.count != 1) data.n = this.count;

		return data;

	}

	get stack() { return true }
	count: number = 1;

	private spell: string;


	constructor(id: string | undefined, spell: string, opts?: { desc?: string, name?: string }) {

		super(id, { type: ItemType.Scroll, ...opts });

		this.type = ItemType.Scroll;
		this.spell = spell;

	}

	use(game: Game, char: TActor, targ?: TActor) {

		const spell = GetSpell(this.spell);


	}

}