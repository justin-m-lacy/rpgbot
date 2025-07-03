import { Inventory } from "rpg/inventory";
import { Spell } from "rpg/magic/spell";
import { GetSpell } from "rpg/parsers/spells";
import { SymDecode } from "rpg/values/types";

export class SpellList extends Inventory<Spell> {

	[SymDecode](data: any) {

		return Inventory.Decode(data, (s: string) => {
			return GetSpell(s) ?? undefined;
		});

	}

	toJSON() {

		const data = super.toJSON();
		data.items = data.items?.map((v: Spell) => v.id);
		return data;

	}

	constructor(id: string) {

		super(id, { name: 'Spells' });

	}


}