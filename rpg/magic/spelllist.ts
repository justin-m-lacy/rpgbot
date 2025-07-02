import { Inventory } from "rpg/inventory";
import { Spell } from "rpg/magic/spell";

export class SpellList extends Inventory<Spell> {


	constructor(id: string) {

		super(id, { name: 'Spells' });

	}


}