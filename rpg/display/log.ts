import { SendableChannels } from "discord.js";

export class Log {

	// channel last used for public logs.
	channel: SendableChannels | null = null;

	private text: string = '';
	constructor() { }

	// send public message, if possible.
	send(s: string) {
		if (this.channel) {
			return this.channel.send({
				content: s
			});
		} else {
			this.log(s);
		}
	}

	/**
	 * Gets and clears the current log text.
	 * @returns The current log text.
	 */
	flushLog() {
		const t = this.text;
		return t;
	}

	log(str: string) { this.text += str + '\n'; }
	output(str: string = '') { return this.text + str; }
	clear() { this.text = ''; }

}