import { Actor } from 'rpg/char/actor';
import { Char } from 'rpg/char/char';
import { Dot } from 'rpg/magic/dots';
import { TActor } from 'rpg/monster/monster';

export type CharEvents = {

	dotStart: (char: Actor, efx: Dot) => void;
	dotEnd: (char: Actor, efx: Dot) => void;
	died: (char: Char) => void;
	revived: (char: Char) => void;
	levelUp: (char: Char) => void;

}


export type TGameEvents = {
	actorDie: (char: TActor, attacker?: TActor) => void;
}