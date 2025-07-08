import { Actor } from "rpg/char/actor";
import { Char } from "rpg/char/char";
import { ActionFlags, TCombatAction } from "rpg/combat/types";
import { AttackInfo } from "rpg/events";
import { Game } from "rpg/game";
import { Spell } from "rpg/magic/spell";
import { Mob, TActor } from "rpg/monster/monster";
import { Party } from "rpg/social/party";
import { AddValues } from "rpg/values/apply";
import { Numeric, TValue } from "rpg/values/types";
import { Loc } from "rpg/world/loc";

/**
 * Handle combat for a single game context.
 */
export class Combat {

	private readonly game: Game;

	constructor(game: Game) {
		this.game = game;
	}

	async attack(src: TActor, act: TCombatAction, targ: TActor | Party, srcParty?: Party) {

		const d = targ instanceof Party ? await targ.randTarget() : targ;
		if (!d) { console.warn('tryHit() targ null'); return; }

		//const attack = new AttackInfo(src, d, srcParty);

		this.resp += `${src.name} attacks ${targ.name} with ${attack.name}`;

		if (attack.hit) {

			this.resp += `\n${d.name} was hit for ${attack.dmg} ${attack.dmgType} damage.`;
			this.resp += ` hp: ${d.hp.valueOf()}/${d.hp.max.valueOf()}`;

		} else this.resp += `\n${src.name} misses!`;

		this.attacks.push(attack);

	}

	/**
	 * Apply combat action to target.
	 * @param char 
	 * @param act 
	 * @param targ 
	 */
	applyAction(char: TActor, act: TCombatAction, targ: Actor | Mob, at: Loc) {

		if (!targ?.isAlive()) return false;
		if (targ.isImmune(act.kind)) return false;

		if (act.dmg) this.applyDmg(targ, act, char);
		if (act.heal) this.applyHealing(targ, act as TCombatAction & { heal: TValue }, char);

		(char instanceof Char ? char : targ).log(`${char.name} hits ${targ.name} with ${act.name}`);

		//if (act.cure) { targ.cure(act.cure); }

		if (act.dot) {
			targ.addDot(act.dot, char.id);
			if (targ instanceof Mob) this.game.setLiveLoc(at);
		}
		if (act.add) {
			AddValues(targ, act.add, 1);
		}

		return true;
	}

	applyDmg(
		targ: TActor,
		attack: TCombatAction,
		attacker?: TActor) {

		const info: AttackInfo = {
			dmg: 0,
			name: attack.name
		};

		let dmg = this.calcDamage(attack.dmg ?? 0, attack, attacker, targ);

		const resist = targ.getResist(attack.kind);
		if (resist !== 0) {
			info.resist = dmg * Math.min(resist / 100, 1);
			dmg -= info.resist;

		}

		if (resist < 1 && !((attack?.actFlags ?? 0) & ActionFlags.nodefense)) {

			//dmg_reduce = (targ.defense?.valueOf() ?? 0) / ((targ.defense?.valueOf() ?? 0) + dmg);
			//dmg -= dmg_reduce * dmg;

		}

		if (info.parried) dmg *= info.parried;


		if (attack.leech && attacker && dmg > 0) {
			info.leech = Math.floor(100 * Number(attack.leech) * dmg) / 100;
			attacker.hp.value += info.leech;
		}

		targ.hp.value += (-dmg);
		info.dmg = dmg;

		this.game.events.emit('charHit', targ, attacker ?? attack.name, info);

		targ.updateState();
		if (!targ.isAlive) {
			this.game.events.emit('actorDie', targ, attacker ?? attack.name);
		}

	}

	async trySpellHit(src: Char | Mob, targ: TActor, spell: Spell, srcParty?: Party) {

		src.log(`${src.name} casts ${spell.name} at ${targ.name}`);

		if (this.rollSpellHit(src, targ)) {

		} else {

		}

	}

	rollMeleeHit(char: TActor, defender: TActor) {

		if (this.weap == null) {
			return false;
		}

		const hitroll = char.statRoll() + char.toHit + this.weap.toHit;
		if (hitroll > defender.armor) {
			return true;
		}

	}

	rollSpellHit(src: Char | Mob, targ: TActor) {

		/// todo: some bs formula.
		const roll = (src.statRoll('int') + src.toHit) * Math.random();
		if (roll > (targ.level.valueOf() + targ.statRoll())) {
			return true;
		} else {
			return false;
		}

	}

	applyHealing(target: TActor, attack: TCombatAction & { heal: Numeric }, attacker?: TActor) {

		target.hp.value += this.calcDamage(attack.heal, attack, attacker, target);

	}

	/**
	 * TODO: more complex damage bonuses.
	 * @param dmg 
	 * @param attack 
	 * @param attacker 
	 * @param target 
	 * @returns 
	 */
	calcDamage(dmg: Numeric, attack: TCombatAction, attacker?: TActor, target?: TActor) {
		return dmg.valueOf();
	}

}



