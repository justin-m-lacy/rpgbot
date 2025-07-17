import { TActor } from "rpg/char/mobs";
import { TargetFlags } from "rpg/combat/targets";
import { Game } from "rpg/game";
import { Numeric } from "rpg/values/types";

type Hate = Record<string, number>;

export const useLikeStore = (game: Game) => {

	const likes: WeakMap<TActor, Hate> = new WeakMap();

	return {

		likes,
		addLike(mob: TActor, some: { id: string }, amt: number) {
			let cur = this.likes.get(mob);
			if (cur) {
				cur[some.id] = (cur[some.id] ?? 0) + amt;
			} else {
				this.likes.set(mob, { [some.id]: amt });
			}
		},
		action(mob: TActor, by: { id: string, level: Numeric }, amt: number, targ: TargetFlags = TargetFlags.any) {

			if (targ & TargetFlags.harmless) {
				amt = -amt;
			}
			this.addLike(mob, by, amt / (by.level.valueOf() || 1));

		},
		getOpinion(mob: TActor, other: TActor) {
			return this.likes.get(mob)?.[other.id] ?? 8 * (mob.team & other.team);
		},

		/**
		 * Get a target to attack.
		 * @param mob 
		 */
		getTargId(mob: TActor) {

			const all = this.likes.get(mob);
			if (!all) return null;

			let min = 0;
			let top: string | null = null;
			for (const k in all) {
				if (all[k] < min) {
					min = all[k];
					top = k;
				}
			}
			return top;

		},

		/// unnecessary: weak keys.
		remove(mob: TActor) {
			this.likes.delete(mob);
		}

	}

}