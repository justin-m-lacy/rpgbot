import { CustomButton } from "@/bot/command-map";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { Char } from "rpg/char/char";
import type { Game } from "rpg/game";
import type { Item } from "rpg/items/item";
import { Wearable } from "rpg/items/wearable";

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

/// Max discord button rows/cols
const MAX_ROWS = 5;
const MAX_COLS = 5;

export const ToActionRows = (buttons: ButtonBuilder[]) => {

	const actRows: ActionRowBuilder<ButtonBuilder>[] = [];

	let actRow: ActionRowBuilder<ButtonBuilder>;

	for (let i = 0; i < buttons.length; i++) {

		if ((i % MAX_COLS) === 0) {

			if (actRows.length === MAX_ROWS) break;

			actRow = new ActionRowBuilder<ButtonBuilder>();
			actRows.push(actRow);
		}
		actRow!.addComponents(buttons[i]);

	}

	return actRows;

}

export const OtherCharActions = (game: Game, char: Char, myChar?: Char, nohostile?: boolean) => {

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
export const OwnCharActions = () => {

	return new ActionRowBuilder<ButtonBuilder>().addComponents(

		new ButtonBuilder({
			customId: 'inv',
			label: 'Inventory',
			style: ButtonStyle.Secondary
		}),
		new ButtonBuilder({
			customId: 'equip',
			label: 'Equipment',
			style: ButtonStyle.Secondary
		}),
		new ButtonBuilder({
			customId: 'rest',
			label: 'Rest',
			style: ButtonStyle.Secondary
		})

	);
}

/**
 * Actions for equipped item.
 */
export const EquipItemActions = (item: Wearable) => {

	const acts = new ActionRowBuilder<ButtonBuilder>();
	acts.addComponents(
		CustomButton({
			customId: 'unequip',
			label: 'Unequip'
		}, {
			slot: item.slot
		})
	);

	return acts;

}


/**
 * Action for items in character's inventory.
 */
export const CharItemActions = (item: Item) => {

	const acts = new ActionRowBuilder<ButtonBuilder>();
	acts.addComponents(
		CustomButton({
			customId: 'drop',
		}, {
			start: item.id
		})
	);

	if (item instanceof Wearable) {
		acts.addComponents(
			CustomButton({
				customId: 'equip',
			}, {
				item: item.id
			})
		);
	}

	return acts;

}

/**
 * 
 * @param item 
 * @returns 
 */
export const WorldItemActions = (item: Item) => {

	const acts = new ActionRowBuilder<ButtonBuilder>();
	acts.addComponents(
		CustomButton({
			customId: 'take',
		}, {
			start: item.id
		})
	);

	return acts;

}