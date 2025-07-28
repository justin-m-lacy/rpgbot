import { Spell } from "rpg/effects/spell.js";
import { Inventory } from "rpg/items/inventory.js";
import { GetSpell } from "rpg/parsers/spells";
import { SymDecode } from "rpg/values/types";

export class SpellList extends Inventory<Spell> {

	[SymDecode](data: any) {

		return Inventory.Revive(data, (s: string) => {
			return GetSpell(s) ?? undefined;
		});

	}

	toJSON() {

		const data = super.toJSON();
		data.items = data.items?.map((v: Spell) => v.id);
		return data;

	}

	constructor(id: string) {

		super({ id, name: 'Spells' });

	}


}