import type { ChatCommand } from "@/bot/cmd-wrapper";
import { CommandData, NewCommand, StrOpt } from "@/bot/command";
import { ReplyEmbed } from "@/embeds";
import { SendPrivate } from "@/utils/display";
import { PickNpcButtons } from "rpg/components";
import { ReplyBlock } from "rpg/display/display";
import { Rpg } from "rpg/rpg";

export default NewCommand<Rpg>({
	cls: Rpg,
	data: CommandData('view', 'View creature at location')
		.addStringOption(StrOpt('npc', 'Creature to view.')),
	async exec(m: ChatCommand, rpg: Rpg) {

		const char = await rpg.myCharOrErr(m, m.user);
		if (!char) return;

		const npcId = m.options.getString('npc');

		if (!npcId) {

			const loc = await rpg.world.getOrGen(char.at);
			if (!loc?.npcs.length) {
				return SendPrivate(m, `${char.name} does not see any creatures here.`);
			}
			return SendPrivate(m, `View which creature?`, {
				components: PickNpcButtons('view', loc.npcs, 'npc')
			});

		}

		const info = await rpg.world.view(char, npcId);
		if (!info) {
			const loc = await rpg.world.getOrGen(char.at);
			return SendPrivate(m, `Creature not found`, {
				components: PickNpcButtons('view', loc.npcs, 'npc')
			});
		}

		if (typeof (info) === 'string') return await ReplyBlock(m, info);
		else return ReplyEmbed(m, info[0], info[1]);

	}

});