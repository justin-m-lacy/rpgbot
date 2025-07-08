import { precise } from 'rpg/util/format';
import { IMod, IModdable, ModState, SymMod } from '../imod';
import { Id, Numeric } from '../types';


export class PctMod implements IMod {

  readonly [SymMod] = true;

  toJSON() {

    if (this.pct === 0) return this.value;

    return `${this.value || ''}${this.pct > 0 ? '+' : ''}${100 * this.pct}%`;

  }

  readonly source: Numeric;
  readonly id: string;

  readonly priority = 0;

  /// percent bonus. Doesn't count implicit 1.
  pct: number = 0;

  /// additive bonus applied.
  value: number = 0;

  /// count of times mod is applied. can be overridden in sublcasses.
  get count() { return +(this.source); }
  set count(_v) { }

  constructor(id: Id, vars?: Numeric | { bonus?: number, pct?: number }, source: Numeric = 0) {

    this.id = id;
    this.source = source;

    this.initVars(vars);

  }

  applyMod(_: IModdable, state: ModState): void {

    state.bonus += this.value * (+this.source);
    state.pct += this.pct * (+this.source);

  }

  toString() {

    let s = this.value !== 0 ? precise(this.value).toString() : '';

    if (this.pct !== 0) {

      if (this.value !== 0) s += ' ';
      s += (this.pct > 0 ? '+' : '') + precise(100 * this.pct) + '%';
    }
    return s;
  }

  private initVars(vars?: Numeric | { bonus?: number, pct?: number }) {

    if (typeof vars === 'number') {
      this.value = vars;
    } else if (vars) {

      if ('value' in vars) {

        this.value = vars._val;
        this.pct = 0;

      } else {
        this.value = vars.bonus ?? 0;
        this.pct = vars.pct ?? 0;

      }

    }
  }
}