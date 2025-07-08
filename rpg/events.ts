import { Actor } from 'rpg/char/actor';
import { Char } from 'rpg/char/char';
import { Dot } from 'rpg/magic/dots';
import { Mob, TActor } from 'rpg/monster/monster';

export type CharEvents = {

	dotStart: (char: Actor, efx: Dot) => void;
	dotEnd: (char: Actor, efx: Dot) => void;
	died: (char: Char) => void;
	revived: (char: Char) => void;
	levelUp: (char: Char) => void;

}


export type TGameEvents = {
	mobDie: (m: Mob, attacker?: TActor) => void;
	charDie: (char: Char, attacker?: TActor) => void;
}