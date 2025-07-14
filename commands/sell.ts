import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { OptionButtons } from "rpg/components";
import { SendPrivate } from "rpg/display/display";
import { Rpg } from "rpg/rpg";
import { Feature } from "rpg/world/feature";
import { IsShop, Shop } from "rpg/world/shop";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('sell', 'Sell items to a shop')
		.addStringOption(StrOpt('item', 'Inventory item to sell').setRequired(true))
		.addStringOption(StrOpt('shop', 'Shop to sell to'))
		.addStringOption(StrOpt('end', 'End of range of items to sell. (Optional)')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const item = m.options.getString('item', true);
		const end = m.options.getString('end');
		let shopName = m.options.getString('shop');

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;


		const loc = await rpg.world.fetchLoc(char.at);
		let shop: Shop | Feature | null;

		if (!shopName || !loc) {
			const shops = loc?.features.filter<Shop>(IsShop) ?? [];
			if (shops.length === 0) {
				return SendPrivate(m, `You do not see a shop here.`);
			} else if (shops.length > 1) {

				return SendPrivate(m, `Sell to which shop?`,
					{
						components: OptionButtons('sell', shops, 'shop', {
							item: item
						})
					});

			} else {
				shop = shops[0] as Shop;
			}

		} else {
			shop = loc.getFeature(shopName ?? 1);
			if (!shop) {
				return SendPrivate(m, `Shop ${shopName} not found.`);
			} else if (!(shop instanceof Shop)) {
				return SendPrivate(m, `${shop.name} is not a shop`);
			}
		}

		await rpg.game.exec('sell', char, shop as Shop, item, end);

		return SendPrivate(m, char.flushLog());

	}
})