import { CommandData, NewCommand, StrChoices, StrOpt } from "@/bot/command";
import type { ChatCommand } from "@/bot/wrap-message";
import { SendPrivate } from "@/utils/display";
import { GenChar } from "rpg/builders/chargen";
import type { GClass, Race } from "rpg/char/race";
import { EchoChar } from "rpg/display/display";
import { GetClass, GetClasses, GetRace, GetRaces, RandClass, RandRace } from "rpg/parsers/parse-class";
import { Rpg } from "rpg/rpg";
import { GetUserLevels } from "rpg/users/users";

const RaceChoices = (arr: Array<Race | GClass>) => {
	return arr.map((v) => {
		return { name: v.name, value: v.name }
	});
}

const LevelCheck = (m: ChatCommand, race: Race | GClass, userLevels: number) => {
	if (userLevels < race.minLevels) {
		SendPrivate(m, `Too few Character levels for ${race.name}. ${userLevels}/${race.minLevels} required`);
		return false;
	}
	return true;
}

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('rollchar', 'roll new character')
		.addStringOption(StrOpt('name', 'character name'))
		.addStringOption(StrChoices('race', 'character race', RaceChoices(GetRaces())))
		.addStringOption(StrChoices('class', 'character class', RaceChoices(GetClasses())))
		.addStringOption(StrChoices('sex', 'character sex', [{ name: 'male', value: 'm' }, { name: 'female', value: 'f' }])),
	async exec(m: ChatCommand, rpg: Rpg) {
		try {

			const racename = m.options.getString('race');
			const classname = m.options.getString('class');
			let charname = m.options.getString('name');
			const sex = m.options.getString('sex') ?? Math.random() < 0.5 ? 'm' : 'f';

			const userData = await rpg.getUserData(m.user.id);
			const userLevels = GetUserLevels(userData);

			const race = racename ? GetRace(racename) : RandRace(racename, userLevels);
			if (!race) return SendPrivate(m, 'Race ' + racename + ' not found.');

			const charCls = classname ? GetClass(classname) : RandClass(classname, userLevels);
			if (!charCls) return SendPrivate(m, 'Class ' + classname + ' not found.');

			if (!LevelCheck(m, race, userLevels)) return;
			if (!LevelCheck(m, charCls, userLevels)) return;

			if (charname) {

				if (!rpg.context.isValidKey(charname)) return SendPrivate(m, `'${charname}' contains illegal letters.`);
				if (await rpg.charExists(charname)) return SendPrivate(m, `Character '${charname}' already exists.`);

			} else charname = await rpg.uniqueName(race, sex);

			const char = GenChar(m.user.id, race, charCls, charname, sex);

			await rpg.setUserChar(m.user, char);
			EchoChar(m, char);
			await rpg.saveChar(char, true);

		} catch (e) { console.log(e); }
	}
})