import { NewCommand, StrChoices, StrOpt, type ChatAction, type Command } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { GenChar } from "rpg/builders/chargen";
import { EchoChar } from "rpg/display/display";
import { GetClass, GetRace, RandClass, RandRace } from "rpg/parsers/classes";
import { Rpg } from "rpg/rpg";

export default {
	cls: Rpg,
	data: NewCommand('rollchar', 'roll new character')
		.addStringOption(StrOpt('name', 'character name'))
		.addStringOption(StrOpt('race', 'character race'))
		.addStringOption(StrOpt('class', 'character class'))
		.addStringOption(StrChoices('sex', 'character sex', [{ name: 'male', value: 'm' }, { name: 'female', value: 'f' }])),
	async exec(m: ChatAction, rpg: Rpg) {
		try {

			const racename = m.options.getString('race');
			const classname = m.options.getString('class');
			let charname = m.options.getString('name');
			const sex = m.options.get('sex') ?? Math.random() < 0.5 ? 'm' : 'f';

			const race = racename ? GetRace(racename) : RandRace(racename);
			if (!race) return SendPrivate(m, 'Race ' + racename + ' not found.');

			const charCls = classname ? GetClass(classname) : RandClass(classname);
			if (!charCls) return SendPrivate(m, 'Class ' + classname + ' not found.');

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
} as Command<Rpg>