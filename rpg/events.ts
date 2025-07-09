import { Actor } from 'rpg/char/actor';
import { Char } from 'rpg/char/char';
import { Dot } from 'rpg/magic/dots';
import { TActor } from 'rpg/monster/mobs';

export type AttackInfo = {

	dmg: number,
	name: string,

	// kind of damage.
	kind?: string,
	// amounted resisted.

	// type of attack (spell, sword, claws, etc.)
	type?: string,

	resist?: number,
	leech?: number,
	reduced?: number,
	parried?: number,


}

export type CharEvents = {

	dotStart: (char: Actor, efx: Dot) => void;
	dotEnd: (char: Actor, efx: Dot) => void;
	died: (char: Char) => void;
	revived: (char: Char) => void;
	levelUp: (char: Char) => void;

}


export type TGameEvents = {
	charDie: (char: TActor, attacker: TActor | string) => void;
	charHit: (char: TActor, attacker: TActor | string, info: AttackInfo) => void;
}