import { CustomButton } from "@/bot/command-map";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { Char } from "rpg/char/char";
import type { Game } from "rpg/game";
import type { Inventory } from "rpg/inventory";
import type { Item } from "rpg/items/item";
import { Wearable } from "rpg/items/wearable";
import type { Mob } from "rpg/monster/mobs";
import { Loc } from "rpg/world/loc";

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

export const PickCharButtons = (cmd: string, chars: string[] | Char[], param: string = 'who') => {

	if (chars.length === 0) return [];
	if (typeof chars[0] === 'string') {

		return ToActionRows(

			(chars as string[]).map(c => CustomButton({
				customId: cmd,
				label: c
			}, {
				[param]: c
			}))
		)
	}

	return ToActionRows(

		(chars as Char[]).map(c => CustomButton({
			customId: cmd,
			label: c.name
		}, {
			[param]: c.name
		}))
	);
}

export const PickTargButtons = (cmd: string, loc: Loc, param: string = 'who') => {

	const chars = loc.chars;
	const npcs = loc.npcs;

	if (chars.length + npcs.length == 0) return [];

	const btns: ReturnType<typeof CustomButton>[] = []

	for (let i = 0; i < chars.length; i++) {
		btns.push(CustomButton({
			customId: cmd,
			label: chars[i] ?? 'unknown'
		}, {
			[param]: chars[i]
		}));
	}

	for (let i = 0; i < npcs.length; i++) {
		btns.push(CustomButton({
			customId: cmd,
			label: npcs[i].name ?? 'unknown'
		}, {
			[param]: npcs[i].id
		}));
	}


	return ToActionRows(btns);

}


export const PickNpcButtons = (cmd: string, chars: Array<Char | Mob>, param: string = 'who') => {
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
 * @param props - additional props to pass to command.
 */
export const InventoryButtons = (cmd: string, inv: Inventory<Item>, param: string = 'item', props?: Record<string, number | string | null | undefined>) => {

	if (inv.items.length == 0) return [];
	return ToActionRows(

		inv.items.map(it => CustomButton({
			customId: cmd,
			label: it.name
		}, {
			[param]: it.id,
			...props
		}))
	);

}

/**
 * Make buttons for a command with Array options.
 * @param cmd - command name.
 * @param opts 
 * @param param - name of command parameter for picked item. (e.g. 'item' or 'char')
 * @param params - additional paramaters to send to command.
 */
export const OptionButtons = <T extends { id: string, name: string }>(
	cmd: string, opts: T[], param: string, params?: Record<string, string | number | undefined | null>) => {

	if (opts.length == 0) return [];
	return ToActionRows(

		opts.map(it => CustomButton({
			customId: cmd,
			label: it.name
		}, {
			[param]: it.id,
			...params
		}))
	);


}