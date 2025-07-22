import { SymMod, type IMod, type IModdable, type ModState } from '../imod';
import type { Id, Numeric } from '../types';

/**
 * A mod that adds a base amount times a source value,
 * to its target.
 */
export class BaseMod implements IMod {

  readonly [SymMod] = true;

  [Symbol.toPrimitive]() {
    return this.value;
  }

  toJSON() { return this.value; }

  toString() {
    return this.value !== 0 ? this.value.toString() : '';
  }

  /**
   * The source of the mod. Mod bonus is multiplied
   * by this amount.
   */
  readonly source: Numeric;
  readonly id: string;

  // bonus amount applied.
  value: number = 0;

  /// count of times mod is applied.
  get count() { return +(this.source) }
  set count(_: number) { }

  readonly name: string | undefined;

  constructor(id: Id, vars?: Numeric, source: Numeric = 1, name?: string) {

    this.id = id;
    this.source = source;

    this.name = name;

    this.value = typeof vars === 'number' ? vars : (vars?.value ?? 0);

  }

  applyMod(_: IModdable, state: ModState): void {

    // Value might be altered by mods. bonus is a raw base.
    state.bonus += (+this.source) * this.value;

  }

}