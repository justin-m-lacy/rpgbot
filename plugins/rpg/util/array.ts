
/**
 * Determines if array contains any of the given params.
 * @param {Array} arr - array to test for inclusions.
 * @param  {...any} params - arguments to test for inclusion in array.
 * @returns {boolean} - true if at least one param is found in the array.
 */
export const includesAny = <T>(arr: T[], ...params: T[]) => {

	for (let i = params.length - 1; i >= 0; i--) {
		if (arr.includes(params[i])) return true;
	}
	return false;

}


/**
 * Array utilities.
 */
export const swap = <T>(a: T[], i: number, j: number) => {

	if (i < 0 || j < 0 || i >= a.length || j >= a.length) return;

	const t = a[j];
	a[j] = a[i];
	a[i] = t;

}


/**
 * If a exists, merges elements of array b into a, in place.
 * If a is null, return a copy of b.
 */
export const mergeInto = <T>(a: T[] | null | undefined, b: T[] | null | undefined) => {

	if (!b) return undefined;
	if (!a) return b.slice();

	a.push(...b);
	return a;

}

/**
 * Merges items from b into array a for all items in b
 * passing predicate p.
 * @param {T=>boolean} p - merge test.
 * @returns {array} returns a
 */
export const mergeIf = <T>(a: T[] | null | undefined, b: T[] | null | undefined, p: (it: T) => boolean) => {

	if (!b || !a) return a;

	for (let i = b.length - 1; i >= 0; i--) {
		if (p(b[i])) a.push(b[i]);
	}

	return a;

}

/**
 * Return a random element from any of a number of arrays.
 * @param {Array[]} arrs - array of arrays.
 */
export const randFrom = <T>(arrs: Array<T[]>) => {

	let tot = 0;
	for (let i = arrs.length - 1; i >= 0; i--) tot += arrs[i].length;
	if (tot === 0) return null;

	let j = Math.floor(Math.random() * tot);
	for (let i = arrs.length - 1; i >= 0; i--) {

		if (arrs[i].length >= j) return arrs[i][j];
		j -= arrs[i].length;

	}

	return null;

}

/**
 * Return random array element between two indices.
 * @param {array} a
 * @param {number} i - lower inclusive limit of random.
 * @param {number} j - upper exclusive limit of random.
 * @returns {*}
 */
export const randBetween = <T>(a: T[], i: number, j: number) => {

	return a[Math.floor(i + Math.random() * (j - i))]

}

/**
 * Map Array into non-null elements of a predicate.
 * @param {Arrray} a
 * @param {function} p
 */
export const mapNonNull = <T>(a: T[], p: (it: T) => boolean) => {

	const len = a.length;
	const b = [];
	for (let i = 0; i < len; i++) {

		const elm = p(a[i]);
		if (elm !== null && elm !== undefined) b.push(elm);

	}

	return b;

}

/**
 * Add non-null elements of array b to array a.
 */
export const pushNonNull = <T>(a: T[], b: T[]) => {

	const len = b.length;
	for (let i = 0; i < len; i++) {
		const e = b[i];
		if (e !== null && e !== undefined) a.push(e);
	}
	return a;

}

/**
 * Return first non-null element of array.
 */
export const first = <T>(a: T[]) => {

	const len = a.length;
	for (let i = 0; i < len; i++) {
		const e = a[i];
		if (e !== null && e !== undefined) return i;
	}

}


/**
 * Find the first instance of an element within an array and move it by a
 * specific number of elements.
 * If the amount to be moved would go over array bounds, goes up to the bounds. Does nothing if element isn't found. Non-mutating
 * @param {T[]} arr Array to move elements in
 * @param {T} elm The target element to move
 * @param {number} count Amount of elements to move the target
 * @returns {T[]} The array with the element moved
 */
export const moveElm = <T>(arr: T[], elm: T, count: number) => {

	const ind = arr.indexOf(elm);
	if (ind < 0) return;

	const dest = count > 0 ? Math.min(ind + count, arr.length - 1) : Math.max(ind + count, 0);

	arr.splice(dest, 0, ...arr.splice(ind, 1));

};


/**
 * Find an item in an array matching predicate, remove and return it.
 * @param {Array} a
 * @param {*} pred
 */
export const findRemove = <T>(a: T[], pred: (it: T) => boolean) => {

	for (let i = a.length - 1; i >= 0; i--) {

		if (pred(a[i])) {

			let res = a[i];
			a.splice(i, 1);
			return res;

		}

	}
	return null;

}

/**
 * Return random array element matching predicate.
 */
export const randWhere = <T>(arr: T[] | null | undefined, pred: (it: T) => boolean) => {

	if (arr === null || arr === undefined) return null;

	const st = Math.floor(Math.random() * arr.length);
	let i = st;

	while (!pred(arr[i])) {

		if (--i < 0) i = arr.length - 1;
		if (i === st) return null;

	}

	return arr[i];

}

/**
 * Return a random element from the array.
 */
export const randElm = <T>(arr: T[] | null | undefined) => {
	if (arr === null || arr === undefined) return undefined;
	return arr[Math.floor(Math.random() * (arr.length))];
}

export const quickSplice = <T>(a: T[], i: number) => {

	a[i] = a[a.length - 1];
	a.pop();

}

/**
 * Merge two items which may or may not be arrays,
 * and return array containing the flattened result of both.
 */
export const arrayMerge = <T>(a: T[] | T, b: T[] | T) => {

	if (Array.isArray(a)) {

		if (Array.isArray(b)) return a.concat(b);

		return [...a, b];

	} else if (Array.isArray(b)) {

		return [...b, a];

	} else return [a, b];

}

/**
 * sort array by numeric by numeric property values
 * of object entries. null entries are treated as 0.
 * array entries must be objects.
 * @param prop - numeric property to sort on.
 */
const propSort = <T extends object>(
	arr: T[],
	prop: keyof T) => {

	arr.sort((a, b) => {

		const aProp = a[prop];
		const bProp = b[prop];
		if (typeof aProp !== 'number') {
			if (typeof bProp !== 'number') return 0;
			return 1;
		} else if (typeof bProp !== 'number') return -1;
		return (aProp || 0) - (bProp || 0);
	});

}

/**
 * Binary search array when values at prop are numeric.
 * @param {object[]} arr
 * @param {string} prop
 */
export const binarySearch = <S extends string, T extends { [key in S]: number }>(arr: T[], prop: S, v: number) => {

	let min = 0;
	let max = arr.length;

	while (min < max) {

		let mid = Math.floor(min + max) / 2;
		let cur = arr[mid][prop];

		if (v < cur) {

			max = mid;

		} else if (v > cur) {

			min = mid + 1;

		} else return arr[mid];

	}

	return null;

}