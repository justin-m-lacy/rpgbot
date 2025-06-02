import { SymMod, type IMod, type ModState } from '@/model/imod';
import type { Id, Idable, Numeric } from '@/model/types';


/**
 * Lock or unlock the modded item.
 */
export class UnlockMod implements IMod {

  readonly [SymMod] = true;

  toJSON() { return undefined; }

  toString() {
    return this.unlock.toString();
  }

  /**
   * The source of the mod. Mod bonus is multiplied
   * by this amount.
   */
  readonly source: Numeric;
  readonly id: string;

  private unlock: boolean;

  constructor(id: Id, unlock: boolean = true, source: Numeric = 0) {

    this.id = id;
    this.source = source;
    this.unlock = unlock;

  }

  applyMod(item: Idable & { locked: boolean, value: number }, _state: ModState): void {

    if (item.value <= 1) {
      item.value = 1;
    }
    item.locked = !this.unlock;

  }

}