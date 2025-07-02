import { Item } from './item';

export type ItemPicker<T = Item> = string | number | T;
export type ItemIndex = string | number;

type SimpleItem = {
    id: string,
    name: string,
    type: string,
    attach?: string,
    toString(): string
}

export class Container<T extends SimpleItem = Item> {

    /**
     * @property count
     */
    get count() { return this.items.length; }

    readonly items: T[] = [];
    protected type?: string;

    constructor() {
    }

    toJSON() { return { items: this.items }; }

    /**
     * Removes and returns random item from inventory.
     * @returns random item from Inventory, or null.
     */
    randItem() {

        const len = this.items.length;
        if (len === 0) return null;
        return this.items.splice(Math.floor(len * Math.random()), 1)[0];

    }

    /**
     * Retrieve item by name or index.
     * @param  start
     * @returns  Item found, or null on failure.
     */
    get(start?: ItemIndex,): T | null {

        /// 0 is also not allowed because indices are 1-based.
        if (!start) return null;

        if (typeof start === 'string') {
            const num = parseInt(start);
            if (Number.isNaN(num)) {
                return this.findItem(start);
            } else {
                start = num;
            }
        } else if (Number.isNaN(start)) {
            /// initial index passed was NaN.
            return null;
        }


        start--;
        if (start >= 0 && start < this.items.length) return this.items[start];


        return null;

    }

    /**
     *
     * @param start - start number of items to take.
     * @param end number of items to take.
     * @returns - Range of items found.
     */
    takeRange(start: ItemIndex, end: ItemIndex): T[] | null {

        if (typeof start === 'string') {
            start = parseInt(start);
        }
        if (typeof end === 'string') {
            end = parseInt(end);
        }
        if (isNaN(start) || isNaN(end)) return null;

        if (--start < 0) start = 0;
        if (end > this.items.length) { end = this.items.length; }

        return this.items.splice(start, end - start);

    }

    /**
     * Attempts to remove an item by name or index.
     * @param which
     * @returns item removed, or null if none found.
     */
    take(which?: number | string | T): T | T[] | null {

        if (which === null || which === undefined) return null;

        if (typeof which === 'object') {

            let ind = this.items.indexOf(which);
            if (ind >= 0) return this.items.splice(ind, 1)[0];
            return null;

        }

        if (typeof which === 'string') {

            if (Number.isNaN(which)) {

                which = which.toLowerCase();
                for (let i = this.items.length - 1; i >= 0; i--) {

                    if (this.items[i]?.name.toLowerCase() === which) return this.items.splice(i, 1)[0];

                }
                return null;

            } else {
                which = parseInt(which);
            }

        }

        which--;
        if (which >= 0 && which < this.items.length) return this.items.splice(which, 1)[0];

        return null;

    }

    /**
     *
     * @param name
     */
    findItem(name: string) {

        const lower = name.toLowerCase();
        for (let i = this.items.length - 1; i >= 0; i--) {

            const it = this.items[i];
            if (!it) continue;
            if (it.id === lower) return this.items[i];
            else if (it.name && it.name.toLowerCase() === lower) return this.items[i];

        }
        return null;
    }

    /**
     *
     * @param it
     * @returns starting 1-index where items were added.
     */
    add(it?: T | T[] | (T | null | undefined)[] | null) {

        if (Array.isArray(it)) {
            const ind = this.items.length + 1;

            it = it.filter((v): v is T => v != null);
            this.items.push(...it as T[]);

            return ind;
        }

        if (it != null) {
            this.items.push(it);
            return this.items.length;
        }
        return -1;

    }

    /**
     * Remove all items matching predicate; returns the list of items removed.
     * @param p
     */
    removeWhere(p: (it: T) => boolean) {

        const r = [];

        for (let i = this.items.length - 1; i >= 0; i--) {
            if (p(this.items[i])) r.push(this.items.splice(i, 1)[0]);
        }

        return r;

    }

    /**
     * Apply function to each item in inventory.
     * @param f
     */
    forEach(f: (it: T) => void) {
        return this.items.forEach(f);
    }

}