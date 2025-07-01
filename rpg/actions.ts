import { CmdSplitChar } from "@/bot/command-map";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

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


export const GetOtherCharActions = (charId: string, nohostile?: boolean) => {

	const acts = new ActionRowBuilder<ButtonBuilder>();

	if (!nohostile) {
		acts.addComponents(

			new ButtonBuilder({
				customId: `attack${CmdSplitChar}who=${charId}`,
				label: 'Attack',
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