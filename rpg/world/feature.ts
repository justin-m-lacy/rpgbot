import { Effect } from 'rpg/effects/effect.js';
import { type Game } from 'rpg/game';
import { ItemProto, ItemType } from 'rpg/items/types';
import { Replace } from 'rpg/util/type-utils';
import { type Loc } from 'rpg/world/loc';
import { Char } from '../char/char';
import { Item } from '../items/item';

export type FeatureProto = ItemProto & { effect?: string | string[], fb?: string };

export class Feature<Proto extends FeatureProto = FeatureProto> extends Item<Proto> {

	/**
	 * feedback when using item.
	 */
	get fb() { return this.proto?.fb }

	toJSON() {

		const ob = super.toJSON() as any;

		if (this.effect) {

			const f = Array.isArray(this.effect) ? this.effect.map(v => v.id).join(',') : this.effect.id;
			if (f != this.proto!.effect) {
				ob.effect = f;
			}

		}
		if (this.proto) {
			console.log(`PROTO found...`);
			ob.proto = this.proto.id;
			if (this.desc == this.proto.desc) ob.desc = undefined;
			if (this.name == this.proto.name) ob.name = undefined;
			if (this.price == this.proto.price) ob.price = undefined;
			if (this.effect == this.proto.effect) ob.effect = undefined;
			//if (this.fb) ob.fb = (this.fb != this.proto.fb) ? this.fb : undefined;
		} else {
			console.log(`no proto: ${this.name}`);
		}


		return ob;

	}

	effect?: Effect | Effect[];

	constructor(info: Replace<Proto, { id?: string }>, proto?: Proto) {

		super(info, proto);

		this.type = info.type ?? ItemType.Feature;
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