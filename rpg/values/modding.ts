import { CanApplyMods, CanMod, IsMod, type IMod } from "rpg/values/imod";
import { IsPath, NewPath, type Path } from "rpg/values/paths";

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

			console.log(`cannot mod: ${targ}/${key}`);
			/*AsModded(
				targ,
				key,
				subTarg,
				newMods || ModKeys.includes(key),
				lastTable
			)?.addMod(modVal);*/

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