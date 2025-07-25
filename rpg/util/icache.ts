export interface ICache<T> {

	fetch(key: string): Promise<T | undefined>;
	get(key: string): T | undefined;

	subcache<R extends T = T>(key: string, decoder?: (data: any) => R | null | undefined): ICache<R>;

	cache(key: string, data: T): void;
	store(key: string, data: T): Promise<T>;

}