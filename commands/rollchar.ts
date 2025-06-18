import { NewCommand, StrChoices, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { GenChar } from "rpg/builders/chargen";
import { EchoChar } from "rpg/display/display";
import { RandClass, RandRace } from "rpg/parsers/classes";
import type { Rpg } from "rpg/rpg";

export default {
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

			const race = RandRace(racename);

			if (!race) return await m.reply('Race ' + racename + ' not found.');

			const charCls = RandClass(classname);
			if (!charCls) return await m.reply('Class ' + classname + ' not found.');

			if (charname) {

				if (!rpg.context.isValidKey(charname)) return m.reply(`'${charname}' contains illegal letters.`);
				if (await rpg.charExists(charname)) return m.reply(`Character '${charname}' already exists.`);

			} else charname = await rpg.uniqueName(race, sex);

			const char = GenChar(m.user.id, race, charCls, charname);

			await rpg.setUserChar(m.user, char);
			EchoChar(m, char);
			await rpg.saveChar(char, true);

		} catch (e) { console.log(e); }
	}
} as CommandData<Rpg>