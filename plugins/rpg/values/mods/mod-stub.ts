import { Path } from "@/data/paths";
import { CanApplyMods, IApplyMods, IMod } from '@/model/imod';

/**
 * UNUSED NOW
 * Mods to apply to a nonexistant object or path.
 * Previously used for undefined TagSets
 * If the object is defined later, the mods should apply.
 */
export class ModStub implements IApplyMods {

	/// Using WeakRef here makes it impossible to iterate
	/// the mods later.
	/// Potential memory leak.
	private mods: Set<Path<IMod> | IMod>;

	constructor(mods: Path<IMod> | IMod) {

		this.mods = new Set([mods]);

	}

	/**
	 * Apply existing mods to target object.
	 * Once a mod target is defined, it can take the place
	 * of the Mod stub.
	 * @param targ 
	 */
	applyTo(targ: object) {

		if (CanApplyMods(targ)) {

		} else {

		}

	}

	applyMods(mods: Path<IMod>) {
		this.mods.add(mods);
	}

	removeMods(mods: Path<IMod> | IMod) {
		this.mods.delete(mods);
	}

}