

/**
 * Converts optional key to required key.
 */
export type With<T extends object, K extends keyof T> =

	T & { [p in K]-?: T[p] };


export type Replace<T extends object, R extends object> =
	Omit<T, keyof R> & R;

export type Maybe<Maybe extends object, Always = object> = (Maybe & Always) | Always;