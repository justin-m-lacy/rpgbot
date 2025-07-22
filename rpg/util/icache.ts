export interface ICache<T> {

	fetch(key: string): Promise<T | undefined>;
	get(key: string): T | undefined;

	cache(key: string, data: T): void;
	store(key: string, data: T): Promise<T>;

}