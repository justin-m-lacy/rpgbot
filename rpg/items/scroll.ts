import { Item } from "rpg/items/item";
import { TActor } from "rpg/monster/mobs";
import { GetSpell } from "rpg/parsers/spells";
import { ItemType } from './types';

export class Scroll extends Item {

	static Decode(json: any) {

		const scroll = new Scroll(json.id, json.spell);

		Item.InitData(json);

		return scroll;

	}

	toJSON() {

		const data = super.toJSON();
		data.spell = this.spell;

		return data;

	}

	private spell: string;


	constructor(id: string | undefined, spell: string, opts?: { desc?: string, name?: string }) {

		super(id, { type: ItemType.Scroll, ...opts });

		this.type = ItemType.Scroll;
		this.spell = spell;

	}

	use(char: TActor, targ?: TActor) {

		const spell = GetSpell(this.spell);


	}

}