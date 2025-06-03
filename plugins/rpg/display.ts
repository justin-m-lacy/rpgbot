import { EmbedBuilder, Message, type SendableChannels } from "discord.js";
import type { Numeric } from "plugins/rpg/values/types";
import { Char } from './char/char';

export const blockText = (s: string) => '```' + s + '```';

export const sendEmbed = async (m: Message, s: string, e: string) => m.reply({
	content: '```' + s + '```',
	embeds: [new EmbedBuilder({ image: { url: e } })]
});

export const sendBlock = async (m: Message, s: string) => m.reply('```' + s + '```');

/**
 * Checks if character is a vowel.
 * @param c character to test. 
 */
export const isVowel = (c: string) => {

	c = c.toLowerCase();
	return c === 'a' || c === 'e' || c === 'i' || c === 'o' || c === 'u';
}

export const echoChar = async function (chan: SendableChannels, char: Char, prefix: string = '') {

	const namestr = char.name + ' is a';
	const desc = char.getLongDesc();
	return chan.send(prefix + '```' + namestr + (isVowel(desc.charAt(0)) ? 'n ' : ' ') + desc + '```');

}

/**
 * Format numeric value for display.
 * @param v - number to display.
 * @param n - maximum rounding digits to display.
 */
export const precise = (v: Numeric, n: number = 2): string => {

	if (typeof v === 'object') v = v.value;

	if (v === Math.floor(v)) return v.toFixed(n);

	const maxDivide = Math.pow(10, n);

	let abs = Math.abs(v);
	let divide = 1;

	while ((divide < maxDivide) && abs !== Math.floor(abs)) {

		abs *= 10;
		divide *= 10;

	}

	abs = Math.round(abs) / divide;
	return (v >= 0 ? abs : -abs).toFixed(2);

}


export class Log {

	get text() { return this._text; }
	set text(v) { this._text = v; }

	private _text: string = '';
	constructor() { }

	/**
	 * Gets and clears the current log text.
	 * @returns {string} The current log text.
	 */
	getAndClear() {
		const t = this._text;
		this._text = '';
		return t;
	}

	log(str: string) { this._text += str + '\n'; }
	output(str: string = '') { return this._text + str; }
	clear() { this._text = ''; }

}