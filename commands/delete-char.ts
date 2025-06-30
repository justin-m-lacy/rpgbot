import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('deletechar', 'Delete one of your characters')
		.addStringOption(StrOpt('name', 'Name of character to delete').setRequired(true)),
	async exec(m: ChatCommand, rpg: Rpg) {

		const charname = m.options.getString('name', true);

		if (!charname) return SendPrivate(m, 'Must specify character to delete.');

		const char = await rpg.loadChar(charname);
		if (!char) return SendPrivate(m, `'${charname}' not found on server.`);

		if (!char.owner || char.owner === m.user.id) {

			await rpg.charCache.delete(rpg.getCharKey(charname));

			// TODO: REMOVE LAST LOADED NAME. etc.
			if (rpg.getLastChar(char.owner) === charname) rpg.clearUserChar(char.owner);

			return SendPrivate(m, charname + ' deleted.');

		} else return SendPrivate(m, 'You do not have permission to delete ' + charname);


	}
})