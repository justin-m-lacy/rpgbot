import { Effect } from 'rpg/effects/effect.js';
import { type Game } from 'rpg/game';
import { ItemData, ItemType } from 'rpg/items/types';
import { type Loc } from 'rpg/world/loc';
import { Char } from '../char/char';
import { Item } from '../items/item';

export type FeatureProto<T extends object = {}> = T & ItemData & { effect?: string | string[], fb?: string };

export class Feature<Proto extends object = {}> extends Item {

	/**
	 * feedback when using item.
	 */
	fb?: string;

	toJSON() {

		const ob = super.toJSON() as any;

		if (this.effect) {

			const f = Array.isArray(this.effect) ? this.effect.map(v => v.id).join(',') : this.effect.id;
			if (f != this.proto.effect) {
				ob.effect = f;
			}

		}
		ob.proto = this.proto.id;

		if (this.desc == this.proto.desc) ob.desc = undefined;
		if (this.name == this.proto.name) ob.name = undefined;
		if (this.price == this.proto.price) ob.price = undefined;

		if (this.fb) ob.fb = (this.fb != this.proto.fb) ? this.fb : undefined;

		return ob;

	}

	effect?: Effect | Effect[];
	proto: FeatureProto<Proto>;

	constructor(proto: FeatureProto<Proto>) {

		super(proto);

		this.proto = proto;
		this.type = proto.type ?? ItemType.Feature;
	}

	/**
	 * override func for char enter location.
	 * @param char
	 * @param loc 
	 */
	onEnter?: (f: typeof this, char: Char, loc: Loc) => void;

	use(game: Game, char: Char) {

		if (this.fb) {
			char.log(this.fb.replace('%c', char.name) + ' ');
		}

		if (this.effect) {

			if (Array.isArray(this.effect)) {
				for (let i = 0; i < this.effect.length; i++) this.effect[i].apply(char);
			} else this.effect.apply(char);

		} else {
			char.log('Nothing seems to happen.');
		}

	}

}