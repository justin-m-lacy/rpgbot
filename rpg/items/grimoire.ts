import { Char } from "rpg/char/char";
import { MenuList } from "rpg/display/items";
import { Item } from "rpg/items/item";
import { ItemProto, ItemType } from "rpg/items/types";
import { BadTypeError } from "rpg/util/errors";

type GrimoireProto = ItemProto & {
	kind: string,
	spells: string[]
}
export class Grimoire extends Item {

	readonly spells: string[] = [];

	toJSON() {
		return { kind: this.kind, spells: this.spells, ...super.toJSON() }
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

		Item.SetProtoData(json, grim);

		return grim;

	}

	kind: string;

	constructor(data: { id: string, name: string, desc: string, kind: string, spells?: string[] },
		proto?: GrimoireProto
	) {

		super(data, proto);

		this.kind = data.kind;

		if (data?.spells) {
			this.spells.push(...data.spells);
		}

		this.type = ItemType.Grimoire;

	}

	getView(char?: Char): [string, string | undefined] {
		return [
			super.getDetails(char) + '\n' +
			MenuList(this.spells),
			undefined];
	}

}