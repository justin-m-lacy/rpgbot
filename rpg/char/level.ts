import { Char } from './char';

const requiredExp = (level: number) => {
	return Math.floor(500 * (Math.pow(1.5, level)));
}

export const getNextExp = (char: Char) => {

	let req = requiredExp(char.level.value + 1);

	if (char.cls) req *= char.cls.expMod;
	if (char.race) req *= char.race.expMod;

	return Math.floor(req);

}


export const tryLevel = (char: Char) => {

	if (char.exp < getNextExp(char)) return false;
	char.levelUp();

	return true;

};
