import { NewCommand, StrOpt, type ChatAction } from "@/bot/command";
import { SendBlock } from "rpg/display/display";
import type { HumanSlot } from "rpg/items/wearable";
import { Rpg } from "rpg/rpg";

export default {
	data: NewCommand('worn', 'Get list of worn items or view equipped item')
		.addStringOption(StrOpt('slot', 'equipment slot to view')),
	async exec(m: ChatAction, rpg: Rpg) {

		const char = await rpg.userCharOrErr(m, m.user)
		if (!char) return;

		const slot = m.options.getString('slot', true) as HumanSlot;
		if (!slot) await SendBlock(m, `${char.name} equip:\n${char.listEquip()}`);
		else {

			const item = char.getEquip(slot);
			if (!item) return m.reply('Nothing equipped in ' + slot + ' slot.');
			if (typeof (item) === 'string') return m.reply(item);
			else if (Array.isArray(item)) {

				let r = '';
				for (let i = item.length - 1; i >= 0; i--) {
					r += item[i].getDetails() + '\n';
				}
				return m.reply(r);

			} else return m.reply(item.getDetails());

		} //

	}
}