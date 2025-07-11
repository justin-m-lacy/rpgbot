/**
 * If param is string, return param. Else return fallback.
 * @param s 
 * @param orelse 
 * @returns 
 */
export const ifString = (s: any, orelse: string = ''): string => s && typeof s === 'string' ? s : orelse;


const IntRegEx = /^\d+$/;

export const IsInt = (s: string) => {
	return IntRegEx.test(s);
}