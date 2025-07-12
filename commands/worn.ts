import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendBlock, SendPrivate } from "rpg/display/display";
import type { HumanSlot } from "rpg/items/wearable";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('worn', 'Get list of worn items or view equipped item')
		.addStringOption(StrOpt('who', 'character to view'))
		.addStringOption(StrOpt('slot', 'equipment slot to view')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user)
		if (!char) return;

		const who = m.options.getString('who', true);

		const slot = m.options.getString('slot', true) as HumanSlot;
		if (!slot) await SendBlock(m, `${char.name} equip:\n${char.listEquip()}`);
		else {

			const item = char.getEquip(slot);
			if (!item) return SendPrivate(m, 'Nothing equipped in ' + slot + ' slot.');
			if (typeof (item) === 'string') return m.reply(item);
			else if (Array.isArray(item)) {

				let r = '';
				for (let i = item.length - 1; i >= 0; i--) {
					r += item[i].getDetails(char) + '\n';
				}
				return SendPrivate(m, r);

			} else return SendPrivate(m, item.getDetails());

		} //

	}
});