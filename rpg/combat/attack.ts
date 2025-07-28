import { StatusFlag } from "rpg/char/states";
import { TargetFlags } from "rpg/combat/targets";
import { ActionFlags, TNpcAction } from "rpg/combat/types";
import { ProtoDot } from "rpg/effects/dots.js";
import { HasJSON } from "rpg/parsers/encode";
import { Id, Numeric, TValue } from "rpg/values/types";

export class Attack implements TNpcAction {

	toJSON() {

		return {
			dmg: HasJSON(this.dmg) ? this.dmg.toJSON() : this.dmg,
			tohit: HasJSON(this.tohit) ? this.tohit.toJSON() : this.tohit,
			bonus: HasJSON(this.bonus) ? this.bonus.toJSON() : this.bonus,
			kind: this.kind,
			hits: this.hits || undefined,
			cure: this.cure || undefined,
			state: this.setFlags || undefined,
			target: this.target || undefined,
			result: this.add || undefined,
			dot: this.dot
		};

	}

	id: Id;
	name: string;

	kind?: string;
	type?: string;

	add: any;

	repeatHits?: number;

	dmg?: Numeric;
	heal?: Numeric;
	// life leech from target.
	leech?: TValue;

	tohit: Numeric = 0;
	bonus: Numeric = 0;

	/// dots to set on target
	public dot?: ProtoDot;

	public hits?: TNpcAction[];

	/// flags to set on target on hit.
	public setFlags?: StatusFlag;

	/**
	 * optional targets
	 */
	only?: string;

	/**
	 * @property cure - statuses to cure/remove from target.
	 */
	cure?: StatusFlag;

	target: TargetFlags;

	actFlags: ActionFlags = 0;

	/**
	 * replace with result or spells?
	 */
	summon?: string[];

	/*setKind(k: string | undefined) {

		this.kind = k;
		if (this.dot) {
			if (Array.isArray(this.dot)) {
				this.dot.forEach(v => v.kind = v.kind ?? k);
			} else {
				if (!this.dot.kind) this.dot.kind = k;
			}
		}

	}*/

	constructor(id: string, data: Partial<TNpcAction> &
	{
		harmless?: boolean,
		nodefend?: boolean,
		hits?: Attack[]
	}) {

		this.id = id;
		this.name = data.name ?? id;

		this.dmg = data.dmg;

		this.kind = data.kind;
		this.bonus = data.bonus ?? 0;

		this.tohit = data.bonus ?? 0;

		this.target = data.target ?? TargetFlags.enemy;

		if (data.hits) {
			this.setHits(data.hits);
		}

		this.dot = data.dot;

		if (data.harmless ?? (
			(this.target & (TargetFlags.self | TargetFlags.ally | TargetFlags.allies)))) {
		}

	}

	/// subattacks
	private setHits(v: Attack[] | undefined) {

		this.hits = v;
		if (!v) return;

		for (let i = v.length - 1; i >= 0; i--) {
			const h = v[i];

			if (!h.id) h.id = this.id;
			if (!h.name) h.name = this.name;
			if (!h.kind) h.kind = this.kind;
			if (!(h instanceof Attack)) v[i] = new Attack(this.id, h);

		}
	}
}