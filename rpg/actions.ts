import { CustomButton } from "@/bot/command-map";
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
		acts.addComponents(

			CustomButton({
				customId: 'revive',
				label: 'Revive',
				style: ButtonStyle.Primary
			}, {
				who: char.name
			})

		);
	}

	if (!game.getParty(char)) {
		acts.addComponents(CustomButton({
			customId: 'party',
			label: 'Party',
			style: ButtonStyle.Secondary
		}, {
			who: char.name
		}));
	}

	if (!nohostile) {
		acts.addComponents(

			CustomButton({
				customId: 'attack',
				label: 'Attack',
				style: ButtonStyle.Danger
			}, {
				who: char.name
			}),
			CustomButton({
				customId: 'steal',
				label: 'Steal',
				style: ButtonStyle.Danger
			}, {
				who: char.name
			}),
			CustomButton({
				customId: 'track',
				label: 'Track',
				style: ButtonStyle.Danger
			}, {
				who: char.name
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