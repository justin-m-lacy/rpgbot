
export class Log {

	private text: string = '';
	constructor() { }

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