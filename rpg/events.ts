import { EventEmitter } from 'eventemitter3';
import { Actor } from 'rpg/char/actor';
import { Char } from 'rpg/char/char';
import { Effect } from 'rpg/magic/effects';

export type CharEvents = {

	dotStart: (char: Actor, efx: Effect) => void;
	dotEnd: (char: Actor, efx: Effect) => void;
	died: (char: Char) => void;
	revived: (char: Char) => void;
	levelUp: (char: Char) => void;

}

export type TCharEvents = EventEmitter<CharEvents>;
export type GameEvents = EventEmitter<CharEvents>;