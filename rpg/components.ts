import { CustomButton } from "@/bot/command-map";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { Char } from "rpg/char/char";
import type { Game } from "rpg/game";
import type { Inventory } from "rpg/inventory";
import type { Item } from "rpg/items/item";
import { Wearable } from "rpg/items/wearable";
import type { Monster } from "rpg/monster/monster";

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

		CustomButton({
			customId: 'inv',
			label: 'Inventory',
			style: ButtonStyle.Secondary
		}),
		CustomButton({
			customId: 'equip',
			label: 'Equipment',
			style: ButtonStyle.Secondary
		}),
		CustomButton({
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
			label: 'Drop'
		}, {
			start: item.id
		})
	);

	if (item instanceof Wearable) {
		acts.addComponents(
			CustomButton({
				customId: 'equip',
				label: 'Equip'
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
			label: 'Take'
		}, {
			start: item.id
		})
	);

	return acts;

}

export const PickCharButtons = (cmd: string, chars: Char[], param: string = 'who') => {

	if (chars.length === 0) return [];
	return ToActionRows(

		chars.map(c => CustomButton({
			customId: cmd,
			label: c.name
		}, {
			[param]: c.name
		}))
	);
}

export const PickNpcButtons = (cmd: string, chars: Array<Char | Monster>, param: string = 'who') => {
	if (chars.length === 0) return [];
	return ToActionRows(

		chars.map(c => CustomButton({
			customId: cmd,
			label: c.name ?? 'unknown'
		}, {
			[param]: c.id
		}))
	);
}

/**
 * Create item buttons for an inventory command.
 * @param cmd - command to apply to selected item.
 * @param inv - selectable items. max 25.
 * @param param - id of param to set to item id.
 */
export const PickItemButtons = (cmd: string, inv: Inventory<Item>, param: string = 'item') => {

	if (inv.items.length == 0) return [];
	return ToActionRows(

		inv.items.map(it => CustomButton({
			customId: cmd,
			label: it.name
		}, {
			[param]: it.id
		}))
	);

}