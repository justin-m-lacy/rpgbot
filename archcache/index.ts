
import Emitter from 'eventemitter3';
import CacheItem from './src/item';

type Loader<Data = any> = (key: string) => Promise<Data>;
type Saver = (key: string, data: any) => Promise<any>;
type Deleter = (key: string) => Promise<boolean>;
type Checker = (key: string) => Promise<boolean>;

type Encoder<T> = (data: T) => Promise<any>;
type Decoder<T> = (data: any) => T | null | undefined;


export type CacheOpts<T> = {

	cacheKey?: string,
	/**
	 * function to load items not found in cache from a data
	 * key is the key of the item not found.
	 */
	loader?: Loader<any>;
	/**
	 * function to store data at key.
	 */
	saver?: Saver;

	/**
	 * Encodes data before save.
	 */
	encoder?: Encoder<T>;
	/**
	 * Decodes data after save.
	 */
	decoder?: Decoder<T>;

	/**
	 * function to call when item is being deleted from cache.
	 */
	deleter?: Deleter;

	/**
	 * function that checks the existence of item
	 * in an underlying data store.
	 */
	checker?: Checker,

	/**
	 * Separator between cache keys of subcaches. Defaults to '/'
	 * subcache keys are joined with the seperator and prepended
	 * to the keys of items entered in the cache.
	 */
	subcacheSeparator?: string
}


/**
 * Setting option properties on parent Cache will not propagate changes
 * to subcaches. Use settings() function.
 */
export default class Cache<T = any> extends Emitter {

	get cacheKey() { return this._cacheKey; }
	set cacheKey(v) {
		this._cacheKey = this._fixKey(v);
	}

	private _dict: Map<string, CacheItem<T> | Cache<any>> = new Map();
	get data() { return this._dict; }

	lastAccess: number = 0;
	_cacheKey: string;

	_separator: string = '/';

	/**
	 * function to load items not found in cache from a data
	 * key is the key of the item not found.
	 */
	loader?: Loader<any>;

	/**
	 * function to store data at key.
	 */
	saver?: Saver;

	encoder?: Encoder<T>;
	decoder?: Decoder<T>;

	/**
	 * function to call when item is being deleted from cache.
	 */
	deleter?: Deleter;

	/**
	 * function that checks the existence of item
	 * in an underlying data store.
	 */
	checker?: (key: string) => Promise<boolean>

	constructor(opts?: CacheOpts<T>) {

		super();

		if (opts) {

			this.loader = opts.loader;
			this.saver = opts.saver;
			this.checker = opts.checker;
			this.deleter = opts.deleter;
			this.decoder = opts.decoder;
			this.encoder = opts.encoder;

		}

		this._separator = opts?.subcacheSeparator ?? '/';
		this._cacheKey = opts?.cacheKey ?? this._separator;

	}

	/**
	 *
	 * @param opts - options being set.
	 * @param  opts.loader - function to load items not found in cache from a data store.
	 * @param  opts.saver - function to store a keyed item in the data store.
	 * @param  opts.checker - function to check the existence of a keyed item in the data store.
	 * @param  opts.deleter - function to delete cached items in a data store.
	 * @param [opts.cacheKey='']
	 * @param [propagate=true] - whether the settings should be propagated
	 * to child caches.
	 */
	settings(opts: CacheOpts<T>, propagate: boolean = true) {

		if (opts.hasOwnProperty('loader')) this.loader = opts.loader;
		if (opts.hasOwnProperty('saver')) this.saver = opts.saver;
		if (opts.hasOwnProperty('checker')) this.checker = opts.checker;
		if (opts.hasOwnProperty('deleter')) this.deleter = opts.deleter;
		if (opts.hasOwnProperty('reviver')) this.decoder = opts.decoder;

		const keyChanged = opts.cacheKey !== this._cacheKey;
		this.cacheKey = opts.cacheKey ?? this._cacheKey;

		if (propagate) {

			const dict = this._dict;
			const baseKey = this.cacheKey;

			for (const k in dict) {

				const item = dict.get(k);
				if (item instanceof Cache) {

					const subkey = keyChanged ? this._subkey(baseKey, k) : undefined;
					item.settings({

						...opts,
						cacheKey: subkey

					});

				}

			}

		}

	}

	/**
	 * Retrieves or creates a subcache with the given key.
	 * @param subkey - key of the subcache. Final key is prefixed with
	 * the key of the parent cache.
	 * @param  [decoder=null]
	 */
	subcache<S extends T = T>(subkey: string,
		decoder?: Decoder<S>, encoder?: Encoder<S>): Cache<S> {

		subkey = this._subkey(this._cacheKey, subkey);

		let cache = this._dict.get(subkey);
		if (cache !== undefined && cache instanceof Cache) return cache as Cache<S>;

		this._dict.set(subkey, cache = new Cache<S>({
			loader: this.loader,
			encoder: encoder ?? this.encoder,
			checker: this.checker,
			deleter: this.deleter,
			cacheKey: subkey,
			decoder: decoder
		}));

		return cache as Cache<S>;
	}

	/**
	 * Attempts to find keyed value in the local cache.
	 * If none is found, the value is loaded from the backing store.
	 * @async
	 * @param key
	 * @returns - returns undefined if the value is not found.
	 */
	async fetch(key: string): Promise<T | undefined> {

		const item = this._dict.get(key);
		if (item) {
			if (item instanceof Cache) return undefined;
			item.lastAccess = Date.now();
			return item.data;
		}

		if (!this.loader) return undefined;

		try {

			const data = await this.loader(this._cacheKey + key);
			if (data === undefined) return undefined;

			const value = this.decoder ? this.decoder(data) : data;
			this._dict.set(key, new CacheItem<T>(key, value, false));

			return value as T;

		} catch (e) {

			this.emit('error', 'fetch', key);

		}

	}

	/**
	 * Caches and attempts to store value to backing store.
	 * @async
	 * @param key
	 * @param value - value to store.
	 */
	async store(key: string, value: T): Promise<T> {

		const item = new CacheItem(key, value);
		this._dict.set(key, item);

		item.markSaved();

		if (this.saver) {
			await this.saver(this._cacheKey + key,
				this.encoder ? this.encoder?.(value) : value
			);
		}
		return value;

	}

	/**
	 * Attempts to retrieve a value from the cache without checking the backing store.
	 * @param key
	 * @returns - Undefined if key invalid.
	 */
	get<D = T>(key: string): D | undefined {

		const it = this._dict.get(key);
		if (it !== undefined) {
			it.lastAccess = Date.now();
			return it.data as D;
		}
		return undefined;

	}

	/**
	 * Cache a value without saving to backing store.
	 * Useful when doing interval backups.
	 * @param key
	 * @param value - value to cache.
	 */
	cache(key: string, value: any) {

		const cur = this._dict.get(key);
		if (cur instanceof CacheItem) cur.update(value);
		else this._dict.set(key, new CacheItem(key, value));

	}

	/**
	 * Deletes object from local cache and from the backing store.
	 * @async
	 * @param key
	 * @returns
	 */
	async delete(key: string) {

		this._dict.delete(key);
		if (this.deleter != null) {

			return this.deleter(this._cacheKey + key).then(
				null,
				err => err
			);

		}

	}

	/**
	 * Backup any items that have not been saved within the given timespan.
	 * @async
	 * @emits 'backup'
	 * @param [time=120000] - Time in ms since last save.
	 * @returns
	 */
	async backup(time: number = 1000 * 60 * 2): Promise<any[] | undefined> {

		const saver = this.saver;
		if (!saver) return;

		const now = Date.now();
		const dict = this._dict;

		const saves = [];

		for (const item of dict.values()) {

			if (item instanceof Cache) {

				//subcache.
				saves.push(item.backup(time));

			} else if (item && item.dirty && (now - item.lastSave) > time) {

				saves.push(
					saver(this._cacheKey + item.key,
						this.encoder ? this.encoder(item.data) : item.data)
				);

			}

		} // for

		return Promise.allSettled(saves).then(
			vals => {
				this.emit('backup', this, vals);
				return vals;
			}
		);

	}

	/**
	 * Clear items from cache that have not been accessed recently.
	 * Dirty entries are first saved to file.
	 * @async
	 * @param [time=300000] - Time in ms since last access.
	 * Items not accessed in this time are purged.
	 */
	async cleanup(time: number = 1000 * 60 * 5): Promise<any[] | void> {

		const saver = this.saver;
		if (!saver) return this._cleanNoSave(time);

		const now = Date.now();
		const dict = this._dict;

		const saves = [];

		for (const k in dict) {

			const item = dict.get(k);
			if (item instanceof Cache) {

				saves.push(item.cleanup(time));

			} else if (item && now - item.lastAccess > time) {

				// done first to prevent race conditions on save.
				dict.delete(k);

				if (item.dirty) {

					saves.push(
						saver(this._cacheKey + item.key,
							this.encoder ? this.encoder(item.data) : item.data
						)
					);

				}

			}

		} // for

		return Promise.allSettled(saves).then(vals => {
			this.emit('cleanup', this, vals); return vals
		});

	}

	/**
	 * Clean old items from cache without storing to backing store.
	 * @param time - Minimum time in ms since last access.
	 */
	_cleanNoSave(time: number) {

		const now = Date.now();
		const dict = this._dict;

		for (const k in dict) {

			const item = dict.get(k);
			if (item instanceof Cache) {

				item._cleanNoSave(time);

			} else if (item && now - item.lastAccess > time) {
				dict.delete(k);
			}

		} // for

	}

	/**
	 * Remove an item from cache, without deleting it from the data store.
	 * @param key
	 */
	free(key: string) { this._dict.delete(key); }


	/**
	 * Checks if the keyed data exists in cache or data store.
	 * @async
	 * @param key
	 * @returns
	 */
	async exists(key: string) {

		if (this._dict.has(key)) return true;

		if (this.checker) return this.checker(this._cacheKey + key);

		return false;

	}

	/**
	 * Checks if a data item is locally cached
	 * for the key. Does not check backing store.
	 * @param key
	 * @returns
	 */
	has(key: string) {
		return this._dict.has(key);
	}

	/**
	 * Convert a cache key into valid cacheKey format.
	 * @param key
	 * @returns
	 */
	_fixKey(key: string) {
		if (typeof key !== 'string') return this._separator;
		if (key.length === 0 || key.charAt(key.length - 1) !== this._separator) return key + this._separator;
		return key;
	}

	/**
	 * Create a key for a subcache.
	 * @param parentKey
	 * @param key
	 * @returns key created.
	 */
	_subkey(parentKey: string = this._separator, key: string = '') {
		return parentKey + this._fixKey(key);
	}

}