import { ifString } from "plugins/rpg/util/parse";

let classes: CharClass[];
let classByName: { [name: string]: CharClass };

export class CharClass {

	static GetClass(classname?: string) {
		return classname ? classByName[classname.toLowerCase()] : undefined;
	}

	static RandClass(classname?: string) {

		if (classname) {
			classname = classname.toLowerCase();
			if (classByName.hasOwnProperty(classname)) return classByName[classname];
		}
		return classes[Math.floor(classes.length * Math.random())];

	}

	readonly name: string;
	desc: string = '';

	get baseMods() { return this._baseMods; }
	get infoMods() { return this._infoMods; }
	get HD() { return this._hitdice; }
	get expMod() { return this._expMod ?? 1; }

	readonly talents: string[] = [];
	private _baseMods: any;
	private _infoMods: any;
	private _hitdice: number = 0;
	private _expMod: number = 1;

	constructor(json: any) {

		this.name = ifString(json.name, 'None');
		this.desc = ifString(json.desc);

		this._hitdice = json.hitdice ?? 1;

		if ('baseMods' in json) this._baseMods = json.baseMods;

		if (json.talents) {
			this.talents = json.talents;
		}

		if (json.exp) this._expMod = json.exp;

		if ('infoMods' in json) {
			this._infoMods = json.infoMods;
		}

	}

	hasTalent(t: string) {
		return this.talents.includes(t);
	}

}
initClasses();
function initClasses() {

	classByName = {};
	classes = [];

	try {

		const a = require('../data/classes.json');

		let classObj, charclass;
		for (let i = a.length - 1; i >= 0; i--) {

			classObj = a[i];
			charclass = new CharClass(classObj);
			classByName[charclass.name] = charclass;
			classes.push(charclass);

		}

	} catch (e) {
		console.log(e);
	}

}