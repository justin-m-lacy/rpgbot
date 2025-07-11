import templates from 'data/minions.json';

export class Minion {

	/**
	 * Retrieves a minion template by name.
	 * @param s 
	 */
	static GetTemplate(s: keyof typeof templates) { return templates[s]; }

	static Decode(json: any) {
	}

	toJSON() {
	}

	private _name: string = '';
	private _template: string = '';
	private _hp: number = 0;

	get name() { return this._name; }
	set name(v) { this._name = v; }

	get template() { return this._template; }
	set template(v) { this._template = v; }

	get hp() { return this._hp; }
	set hp(v) { this._hp = v; }

	constructor() {
	}

}