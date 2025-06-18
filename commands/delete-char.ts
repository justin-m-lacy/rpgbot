import { NewCommand, StrOpt, type ChatAction, type CommandData } from "@/bot/command";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('deletechar', 'Delete one of your characters')
		.addStringOption(StrOpt('name', 'Name of character to delete').setRequired(true)),
	async exec(m: ChatAction, rpg: Rpg) {

		const charname = m.options.getString('name', true);

		if (!charname) return m.reply('Must specify character to delete.');

		const char = await rpg.loadChar(charname);
		if (!char) return m.reply(`'${charname}' not found on server.`);

		if (!char.owner || char.owner === m.user.id) {

			await rpg.charCache.delete(rpg.getCharKey(charname));

			// TODO: REMOVE LAST LOADED NAME. etc.
			if (rpg.getLastChar(char.owner) === charname) rpg.clearUserChar(char.owner);

			return m.reply(charname + ' deleted.');

		} else return m.reply('You do not have permission to delete ' + charname);


	}
} as CommandData<Rpg>