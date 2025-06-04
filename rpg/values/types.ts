export type Id = string;

export type Idable = {
	id: string
}

export type TValue = {
	value: number;
}

export type Numeric = TValue | number;


export const SymSimple = Symbol('Simple');


export interface ISimple {

	id: string;
	readonly [SymSimple]: true,
	base: number,
	add(amt: number): void;
}