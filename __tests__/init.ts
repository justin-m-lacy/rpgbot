import Cache from "archcache";
import { Game } from "rpg/game";
import { GameActions } from 'rpg/game-actions';
import { World } from "rpg/world/world";
import fsys from 'src/bot/botfs';

const cache = new Cache({
	cacheKey: '',
	loader: fsys.readData,
	saver: fsys.writeData,
	checker: fsys.fileExists,
	deleter: fsys.deleteData

});


export const GetTestGame = () => new Game(cache, cache.subcache('char'), GameActions, false);


export const GetTestWorld = () =>
	new World(cache.subcache('world'), cache.subcache('chars'));