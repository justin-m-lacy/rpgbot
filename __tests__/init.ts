import { MockCache } from "__tests__/mocks";
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

const FakeCache = MockCache();
export const GetTestGame = () => new Game(new FakeCache(), new FakeCache(), GameActions, false);


const GetTestWorld = () =>
	new World(cache.subcache('world'), cache.subcache('chars'));