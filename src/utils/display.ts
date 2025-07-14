import type { ChatCommand } from '@/bot/cmd-wrapper';
import type { ChatAction } from '@/bot/command';
import { EmbedBuilder, Message, MessageFlags, type SendableChannels } from 'discord.js';

/**
 * Send a no-permission message.
 * @async
 * @param m
 * @param [cmd=null]
 * @returns
 */
const SendNoPerm = (m: ChatAction, cmd?: string) => {

	if (cmd) return m.reply(
		{
			content: `You do not have permission to use the command '${cmd}'`,
			flags: MessageFlags.Ephemeral
		});

	return m.reply({
		content: 'You do not have permission to use that command.',
		flags: MessageFlags.Ephemeral,
	});

}

const MsgMAx = 1700;

/**
 * Regular expression for capitalizing the start of words.
 */
const CapsRegEx = /\b(\w+)\b/g;

/**
 *
 * @param s
 * @returns
 */
export const Capitalize = (s: string) => {

	return CapsRegEx[Symbol.replace](s, (s) => {
		return s[0].toUpperCase() + s.slice(1);
	});

}

/**
 * Break the text into pages based on the maximum content length,
 * and return the indicated page of text.
 * @param text
 * @param page - zero-based page index.
 * @returns - a single page of text out of the total.
 */
const GetPageText = (text: string, page: number = 0) => {
	return text.slice(MsgMAx * page, MsgMAx * (page + 1));
}


/**
 * Gets the total number of pages that would be required to display
 * the text, given the maximum message size.
 * @param text
 * @returns one-based page count.
 */
const PageCount = (text: string) => {
	return Math.floor(text.length / MsgMAx) + 1;
}

/**
 * Makes a standard page count string for the given text.
 * @param text
 * @returns Information about the number of pages required.
 */
const PageFooter = (text: string) => {
	const count = PageCount(text);
	return '( ' + count + ' page result' + (count != 1 ? 's )' : ' )');
}

export const Display = {

	sendAll: async (ch: SendableChannels, strings: string[]) => {

		for (let i = 0; i < strings.length; i++) {
			ch.send(strings[i]);
		}
	},

	SendEmbed: async (m: Message, s: string, url: string) => {

		if (s.length > MsgMAx) s = s.slice(0, MsgMAx);

		return m.reply({
			content: '```' + s + '```',
			embeds: [new EmbedBuilder({ image: { url } })]
		});

	},


	/**
	 * Break a message text into pages, and send it to the required message channel.
	 * @param m
	 * @param text - text to paginate and send.
	 * @param page - zero-based page of text to be sent.
	 */
	async sendPage(chan: ChatCommand, text: string, page: number = 0) {
		return chan.reply(
			{
				content: GetPageText(text, page) + '\n\n' + PageFooter(text),
				flags: MessageFlags.Ephemeral
			}
		);
	},

	/**
	 * Paginates an array of text to only break between items.
	 * @param items
	 * @param page the zero-based index of the page of text to display.
	 * @returns text of page and total page count.
	 */
	paginate(items: string[], page: number = 0): { content: string, pages: number } {

		if (Number.isNaN(page)) page = 0;

		let charCount = 0;

		// item indices for breaking the current page.
		let totalPages = 0, pageStart = 0;
		let pageStr = '';

		const len = items.length;
		for (let i = 0; i < len; i++) {

			const it = items[i];
			charCount += it.length;

			// adding this item's text crossed a page boundary.
			if (charCount >= MsgMAx) {

				if (totalPages === page) pageStr = items.slice(pageStart, i).join('\n');

				totalPages++;
				pageStart = i;
				charCount = it.length;

			}

		} // for

		return { content: pageStr, pages: totalPages + 1 };
	}

}