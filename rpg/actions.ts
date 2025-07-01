import { CmdSplitChar } from "@/bot/command-map";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { Char } from "rpg/char/char";
import type { Game } from "rpg/game";

export const IllegalIdChars = ['/', '\\', ':', '*', '?', '"', '|', '<', '>', '#', '='];

/**
 * Test if name is legal user input.
 * @param s 
 */
export const IsLegalName = (s: string) => {
	for (let i = IllegalIdChars.length - 1; i >= 0; i--) {
		if (s.includes(IllegalIdChars[i])) return false;
	}
	return true;
}


export const GetOtherCharActions = (game: Game, char: Char, myChar?: Char, nohostile?: boolean) => {

	const acts = new ActionRowBuilder<ButtonBuilder>();

	if (!char.isAlive()) {
		acts.addComponents(new ButtonBuilder({
			customId: `revive${CmdSplitChar}who=${char.name}`,
			label: 'Revive',
			style: ButtonStyle.Primary
		}));
	}

	if (!game.getParty(char)) {
		acts.addComponents(new ButtonBuilder({
			customId: `party${CmdSplitChar}who=${char.name}`,
			label: 'Party',
			style: ButtonStyle.Secondary
		}));
	}

	if (!nohostile) {
		acts.addComponents(

			new ButtonBuilder({
				customId: `attack${CmdSplitChar}who=${char.name}`,
				label: 'Attack',
				style: ButtonStyle.Danger
			}),
			new ButtonBuilder({
				customId: `steal${CmdSplitChar}who=${char.name}`,
				label: 'Steal',
				style: ButtonStyle.Danger
			}),
			new ButtonBuilder({
				customId: `track${CmdSplitChar}who=${char.name}`,
				label: 'Track',
				style: ButtonStyle.Danger
			}),

		);
	}

	return acts;

}

/**
 * Get actions usable by own char.
 * @returns 
 */
export const GetOwnCharActions = () => {

	return new ActionRowBuilder<ButtonBuilder>().addComponents(

		new ButtonBuilder({
			customId: 'inv',
			label: 'Inventory',
			style: ButtonStyle.Secondary
		}),
		new ButtonBuilder().setCustomId('equip').setLabel('Equipment').setStyle(ButtonStyle.Secondary)

	);
}