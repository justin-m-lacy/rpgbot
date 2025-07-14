export const IsCoord = (obj: any): obj is { x: number, y: number } => {
	return obj && typeof obj === 'object' && typeof obj.x === 'number' && typeof obj.y === 'number';
}

export type TCoord = {
	x: number, y: number
}

export class Coord implements TCoord {

	x: number;
	y: number;

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	setTo(coord: TCoord) {
		this.x = coord.x;
		this.y = coord.y;
	}

	/**
	 * @returns absolute distance from origin.
	 */
	abs() { return Math.abs(this.x) + Math.abs(this.y); }

	/**
	 * Get distance to another coordinate.
	 * @param c - second coordinate
	 * @returns
	 */
	dist(c: TCoord) { return Math.abs(c.x - this.x) + Math.abs(c.y - this.y); }

	equals(c: TCoord) {
		return c.x === this.x && c.y === this.y;
	}

	toString() {
		return this.x + ',' + this.y;
	}

}