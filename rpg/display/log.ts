
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