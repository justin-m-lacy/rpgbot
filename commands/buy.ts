import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { SendPrivate } from "@/utils/display";
import { OptionButtons } from "rpg/components";
import { Rpg } from "rpg/rpg";
import { Feature } from "rpg/world/feature";
import { IsShop, Shop } from "rpg/world/shop";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('buy', 'Buy items from a shop')
		.addStringOption(StrOpt('item', 'Item to buy').setRequired(true))
		.addStringOption(StrOpt('shop', 'Shop to buy from')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const item = m.options.getString('item', true);
		let shopName = m.options.getString('shop');

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const loc = await rpg.world.getLoc(char.at);

		let shop: Shop | Feature | null;

		if (!shopName || !loc) {
			const shops = loc?.features.filter<Shop>(IsShop) ?? [];
			if (shops.length === 0) {
				return SendPrivate(m, `You do not see a shop here.`);
			} else if (shops.length > 1) {

				return SendPrivate(m, `Buy from which shop?`,
					{
						components: OptionButtons('buy', shops, 'shop', {
							item: item
						})
					});

			} else {
				shop = shops[0];
			}

		} else {
			shop = loc.getFeature(shopName ?? 1);
			if (!shop) {
				return SendPrivate(m, `Shop ${shopName} not found.`);
			} else if (!(shop instanceof Shop)) {
				return SendPrivate(m, `${shop.name} is not a shop`);
			}
		}

		await rpg.game.action('buy', char, shop, item)

		return SendPrivate(m, char.flushLog());

	}
});