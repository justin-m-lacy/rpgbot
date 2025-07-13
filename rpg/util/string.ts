/**
 * Uppercase single string, ignoring spaces.
 * @param s 
 * @returns 
 */
export const Uppercase = (s: string) => {
	return s.length > 1 ? s[0].toUpperCase() + s.slice(1) : s.toUpperCase();
}