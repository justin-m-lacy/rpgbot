// NOT CURRENTLY USED
// TODO: REPLACE WITH PRIORITY QUEUE.
class Scheduler {

	readonly queue: any[] = [];

	constructor() {
	}

	/**
	 * Schedule at a fixed time from now.
	 * @param time 
	 * @param cb 
	 */
	schedIn(time: number, cb: Function) {

		const sched = new SchedTime(Date.now() + time, cb);
		const ind = this.queue.findIndex(it => it.time >= time);
		if (ind < 0) {
			this.queue.push(sched);
		} else {
			this.queue.splice(ind, 0, sched);
		}

	}

	schedule(time: number, cb: Function) {

		const sched = new SchedTime(time, cb);
		const ind = this.queue.findIndex(it => it.time >= time);
		if (ind < 0) {
			this.queue.push(sched);
		} else {
			this.queue.splice(ind, 0, sched);
		}


	}

	peek() {
		if (this.queue.length === 0) return null;
		return this.queue[0];
	}

	dequeue() { return this.queue.shift(); }

}

class SchedTime {

	get cb() { return this._cb; }
	_cb: Function;
	_time: number;

	constructor(time: number, cb: Function) {
		this._time = time;
		this._cb = cb;
	}

}