import { TCombatAction } from "rpg/combat/types";
import { Item } from "rpg/items/item";
import { Spell } from "rpg/magic/spell";
import { TActor } from "rpg/monster/mobs";
import { GetSpell } from "rpg/parsers/spells";
import { type Game } from '../game';
import { ItemType } from './types';

export class Scroll extends Item implements TCombatAction {

	static Decode(json: any) {

		const s = new Scroll(json.id, GetSpell(json.spell));

		Item.InitData(json);
		s.count = typeof (json.n === 'number') ? json.n : 1;

		return s;

	}

	toJSON() {

		const data = super.toJSON();
		data.spell = this.spell?.id;
		if (this.count != 1) data.n = this.count;

		return data;

	}

	get name() { return this.spell ? 'Scroll of ' + this.spell.name : 'blank scroll'; }

	get stack() { return true }
	count: number = 1;

	private spell: Spell | undefined;

	get dmg() { return this.spell?.dmg }
	get cure() { return this.spell?.cure }
	get kind() { return this.spell?.kind ?? 'blank' }

	constructor(id: string | undefined, spell: Spell | undefined, opts?: { desc?: string, name?: string }) {

		super(id, { type: ItemType.Scroll, ...opts });

		this.type = ItemType.Scroll;
		this.level = spell?.level ?? 0;
		this.spell = spell;

	}

	async use(game: Game, char: TActor, targ?: TActor) {

		if (!this.spell) {
			char.log(`The scroll is empty.`);
			return;
		}

		char.send(`${char.name} reads ${this.name}`);
		char.removeItem(this.id);
		await game.attack(char, targ, this.spell);

	}

}