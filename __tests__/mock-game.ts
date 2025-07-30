import { MockCache } from "__tests__/mock-cache";
import Cache from "archcache";
import { Game } from "rpg/game";
import { GameActions } from 'rpg/game-actions';
import fsys from 'src/bot/botfs';

const cache = new Cache({
	cacheKey: '',
	loader: fsys.readData,
	saver: fsys.writeData,
	checker: fsys.fileExists,
	deleter: fsys.deleteData

});

const FakeCache = MockCache();
export const MockGame = () => new Game(new FakeCache(), new FakeCache(), GameActions, false);