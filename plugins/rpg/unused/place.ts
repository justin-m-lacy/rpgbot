export default class Place {

	id: string = '';

	name: string = '';

	parent: Place | null = null;

	static FromJSON(json: object) {
	}

	toJSON() {
	}

	constructor() {
	}


}