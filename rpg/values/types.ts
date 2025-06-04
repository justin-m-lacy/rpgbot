export type Id = string;

export type Idable = {
	id: string
}

export type TValue = {
	value: number;
}

export type Numeric = TValue | number;


export const SymSimple = Symbol('Simple');

export const IsValue = (t: object): t is TValue => {
	return typeof (t as any).value === 'number';
}

export interface ISimple {

	id: string;
	readonly [SymSimple]: true,
	base: number;
	value: number;
	add(amt: number): void;
}