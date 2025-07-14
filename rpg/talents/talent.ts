// talents so far..
/// brew,hike,revive,track,scribe,sneak,steal,scout

export class Talent {

	readonly id: string;

	// stats that modify the talent.
	readonly stats: string[] = [];

	/// talent can only be used with training.
	trained: boolean = false;

	constructor(id: string) {

		this.id = id;

	}

}