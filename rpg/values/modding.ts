import { CanApplyMods, CanMod, IModdable, IsMod, type IMod } from "rpg/values/imod";
import { ToModded } from "rpg/values/mods/modded";
import { IsPath, NewPath, type Path } from "rpg/values/paths";
import { Simple } from "rpg/values/simple";
import { Id, Idable, IsValue, Numeric } from "rpg/values/types";

/// Path keys that are expected to end in Mod objects.
const ModKeys = ["runmod", "mod"];

/**
 * 
 * @param targ - target mods are being applied to.
 * @param mods - path of mods to apply.
 * @param newMods - whether newly created values should be mods.
 * @param lastTable - last table in the target path.
 * This is the source that serves as the count for any newly created mods.
 */
export const ApplyMods = (
	targ: object & any,
	mods: Path<IMod>,
	newMods?: boolean) => {

	for (const key in mods) {

		const subTarg = targ[key];
		const modVal = mods[key];

		if (IsPath(modVal)) {

			if (subTarg === undefined) {

				ApplyMods(
					targ[key] = NewPath(key),
					modVal,
					newMods || ModKeys.includes(key),

				);

			} else if (typeof subTarg === 'object') {

				/// todo: subtarget is array, or set, as in TagSet?
				if (CanApplyMods(subTarg)) {
					subTarg.applyMods(modVal);
					continue;
				} else if (Array.isArray(subTarg)) {
					console.warn(`MOD ARRAY: ${targ.id}.${key}`);
				}

				ApplyMods(
					subTarg,
					modVal,
					newMods || ModKeys.includes(key),
				);

			} else {

				console.warn(`Apply ${modVal} mod to invalid path at: ${key}`,
					`target: ${subTarg} type: ${typeof subTarg}`);
			}

		} else {

			AsModded(
				targ,
				key,
				subTarg
			)?.addMod(modVal);

			/*if (newMods || ModKeys.includes(key)) {
				ModChange.add(IsTable(subTarg) ? subTarg : lastTable);
			}*/

		}

	}

}

/**
 * @param mods
 * @param targ=null
 */
export const RemoveMods = (targ: object & any, mods: Path<IMod> | IMod,) => {

	if (!targ) return;

	if (Array.isArray(targ)) {

		for (const it of targ) {
			RemoveMods(mods, it);
		}

	} else if (CanApplyMods(targ)) {

		targ.removeMods(mods);

	} else if (IsMod(mods)) {

		if (typeof targ === 'object') {
			if (CanMod(targ)) {
				targ.removeMod(mods);
			} else RemoveMods(targ.value, mods);
		}

	} else if (IsPath(mods)) {

		for (const p in mods) {
			RemoveMods(targ[p], mods[p]);
		}

	} else console.warn(' invalid mod: [mods,targ]', mods, targ);

}
/**
 * Ensure current value of obj[prop] is a moddable object.
 * @param obj 
 * @param prop - name of property mod will act on.
 * @param cur - current value of obj[prop]
 * @param isMod - whether the value is on a 'mod' path, and any newly created object
 * should be interpreted as a mod. TODO: use a create func instead?
 * @param source - source for the mod's "count" - number of times mod is applied.
 * Only used when creating a new subMod.
 * @returns 
 */
export function AsModded<
	K extends Id,
>(
	obj: Partial<Record<K, IModdable | Numeric | undefined | null>>,
	prop: K,
	cur: any
) {

	if (CanMod(cur)) return cur;

	if (!cur || typeof cur === 'number') {
		return obj[prop] = new Simple(prop, cur || 0);
	}
	if (IsValue(cur)) {
		return obj[prop] = ToModded(ToIdable(cur, prop));
	}

	console.error(`Can't Mod: ${(obj as any).id}[${prop}] : ${cur}`);

}

export const ToIdable = <T extends object>(it: T, id: string) => {
	if (!('id' in it)) {
		(it as any).id = id;
	}
	return it as T & Idable;
}
