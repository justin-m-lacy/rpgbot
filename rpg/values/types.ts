export type Id = string;

export type Idable = {
	id: string
}

export type TValue = {
	valueOf(): number;
	value: number;
}

export type Numeric = TValue | number;

export const IsValue = (t: any): t is TValue => {
	return t && typeof t === 'object' && typeof (t as any).value === 'number';
}

export const IsSimple = (t: any): t is ISimple => {
	return t && typeof t === 'object' && t[SymSimple] === true;
}

export const SymSimple = Symbol('Simple');

export interface ISimple {

	id: string;
	readonly [SymSimple]: true,
	base: number;
	value: number;
	add(amt: number): void;
}