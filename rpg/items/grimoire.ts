import { Item } from "rpg/items/item";
import { ItemType } from "rpg/parsers/items";
import { BadTypeError } from "rpg/util/errors";

export class Grimoire extends Item {

	readonly spells: string[] = [];

	toJSON() {
		return { spells: this.spells, ...super.toJSON() }
	}

	static Decode(json: any) {

		if (!json || typeof json !== 'object') throw new BadTypeError(json, 'object');

		const grim = new Grimoire(json.id);
		if (json.spells) {

			if (Array.isArray(json.spells)) {
				grim.spells.push(...json.spells);
			} else {
				throw new BadTypeError(json.spells, 'array');
			}

		}

		Item.InitData(json, grim);

		return grim;

	}

	constructor(id: string, data?: { name: string, desc: string, spells?: string[] }) {

		super(id, data);

		if (data?.spells) {
			this.spells.push(...data.spells);
		}

		this.type = ItemType.Grimoire;

	}

}