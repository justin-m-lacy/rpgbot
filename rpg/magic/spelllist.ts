import { Inventory } from "rpg/inventory";
import { Spell } from "rpg/magic/spell";
import { SymEncode } from "rpg/values/types";

export class SpellList extends Inventory<Spell> {


	[SymEncode]() {

		return super[SymEncode]((v: Spell) => v.id);

	}

	constructor(id: string) {

		super(id, { name: 'Spells' });

	}


}