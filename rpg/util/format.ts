import { romanize } from "romans";
import { precise } from "rpg/display";
import type { Numeric } from "rpg/values/types";

/**
 * Lowcase roman numeral.
 * @param n 
 * @returns 
 */
export const romanlow = (n: number) => {
  return romanize(n).toLowerCase();
}

/**
 * Returns abbreviation of item based on first letters.
 * @param {*} it
 */
export const abbr = (it?: { name?: string }) => {

  if (!it) return '';

  const s = it.name;
  if (!s) return it;

  const ind = s.indexOf(' ');
  if (ind > 0 && ind + 1 < s.length) return s[0] + s[ind + 1];
  return s.slice(0, 2);

}

/**
 * Returns number as integer if integer, or else precise.
 * @param v 
 */
export const smallNum = (v: Numeric) => {

  const val = +(v);
  return (Math.floor(val) === val) ? val : precise(val);
}
