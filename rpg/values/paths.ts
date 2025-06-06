import type { Numeric, TValue } from "rpg/values/types";

export type Path<T> = {
  [key in string]: T | Path<T>;
} & {

  id: string;

  get: (key: string) => T | Path<T> | undefined,

  /**
   * Get variable at dest[key] or dest[dest[key]] if key is $varName
   * @param dest 
   * @param key 
   * @returns 
   */
  getKeyed: (dest: Record<string, any>, key: string, src?: Record<string, any>) => any | undefined,

  //addItem: <R extends T | Path<T>>(data: R, id?: string) => R,
  readonly [SymPath]: true
}

export type TValuePath = Path<TValue | Numeric>;

/// determine if a string is a valid variable path.
const PathRegEx = /^(?:[~\/]?[A-Za-z_]+\w*)+(?:\.[A-Za-z_]+\w*)*$/;

/// Test if a string represents a variable path.
export const IsPathStr = (s: string) => {
  return PathRegEx.test(s);
}

/// create child path.
export const JoinPath = (...parts: string[]) => {
  return parts.join('.');
}

const SymPath = Symbol('path');
export const IsPath = <T = any>(obj: any): obj is Path<T> => {
  return obj && typeof obj === 'object' && SymPath in obj;
}

const PathProto = Object.create(null, {

  [SymPath]: {
    value: true,
    writable: false,
    configurable: true,
    enumerable: false
  },
  /*addItem: {
    enumerable: false,
    value<T>(this: Path<T>, item: Path<T> | T, id?: string) {
      return this[id!] = item;
    },
  },*/
  getKeyed: {
    enumerable: false,
    /**
     * 
     * @param this 
     * @param targ - target with value being read.
     * @param key - key on target to read.
     * @param varSrc - source for named variables.
     * @returns 
     */
    value(this: Path<any>, targ: Record<string, any>, key: string, varSrc?: Record<string, any>) {
      if (key.startsWith('$')) {

        // Path is $variableName
        return (varSrc?.ctx ?? targ)[varSrc?.[key.slice(1)]];

      } else {
        return targ[key];
      }
    }
  },
  toString: {
    value() { return this.id },
    enumerable: false
  },
  get: {
    enumerable: false,
    value<T>(this: Path<T>, key: string) {
      return this[key];
    }
  }


});

export const NewPath = <T extends any = TValue>(path: string) => {

  return Object.defineProperty(Object.create(PathProto) as Path<T>, 'id', {

    value: path,
    writable: false,
    enumerable: false
  });

}

/**
 * Parses a Path whose converter function does not require a 'source' Table.
 * Expand object of { `key0.key1...keyN`:Value} into recursive object paths:
 * { key0:{key1:{...keyN:Value}}}
 * Converter converts the original values before inserted into end of path.
 * @param srcVals - Values stored at the leaves of path.
 * @param id - id of Path object.
 * @param converter - Optional converter for each original value item.
 * @returns 
 */
export const ParsePaths = <T extends any, C extends any = T>(
  srcVals: Record<string, T>,
  id: string,
  converter?: (path: string, orig: T) => C,
) => {

  const dest = NewPath<C>(id);

  for (const path in srcVals) {

    const orig = srcVals[path];
    let val: C | undefined | Path<C> = converter?.(path, orig);
    if (val == null && orig != null && typeof orig === 'object') {
      val = ParsePaths(orig as any, path, converter,);
      if (val == null) continue;
    }

    splitToPath(dest, path, val);

  }

  return dest;

}

/**
 * Parses paths using a converter that includes a 'source' Table value.
 * Expand object of { `key0.key1...keyN`:Value} into recursive object paths:
 * { key0:{key1:{...keyN:Value}}}
 * Converter converts the original values before inserted into end of path.
 * @param srcVals - Values stored at the leaves of path.
 * @param source - Table path is defined on.
 * @param converter - Optional converter for each original value item.
 * @returns 
 */
export const ParseTablePaths = <Vals extends any, S extends any, C extends any = Vals,>(
  srcVals: Record<string, Vals> | string,
  source: S,
  id: string,
  converter?: (orig: Vals, key: string, table: S) => C,
) => {

  if (typeof srcVals === 'string') {
    srcVals = { [srcVals]: 1 } as Record<string, Vals>;
  }

  const dest = NewPath<Exclude<C, undefined>>(id);

  for (const path in srcVals) {

    const value = srcVals[path];
    const converted: C | undefined | Path<C> = converter?.(value, path, source);
    if (converted === undefined && typeof value === 'object' && value != null) {
      /// try parse subpath
      console.log(`convert fail: ${(source as any).id}: ${path}: ${value}`);
      continue;
    }
    splitToPath(dest, path, converted);
  }

  return dest;

}

/**
 * Merge path items from src into dest.
 * @param dest 
 * @param src 
 */
export const MergePaths = <T extends any>(dest: Path<T>, src: Path<T>) => {

  for (const key in src) {

    const v = src[key];
    const into = dest[key];

    if (!into) dest[key] = v;
    else if (IsPath(into) && IsPath(v)) {
      MergePaths(into, v);
    } else {
      console.warn(`cant merge path: ${key}:${v} into ${key}:${into}`)
    }

  }

}

/**
 * Expand the a [key,value] pair into subpath objects
 * in dest.
 * @param key 
 * @param srcVals - 
 * @param dest - Path object the key/value should be expanded into
 */
export const splitToPath = <K extends string, T extends any>(
  dest: Path<T>,
  key: K,
  value?: T,
) => {

  if (value === undefined) return;

  const parts = key.split('.');

  /// final key leads to original value.
  const lastInd = parts.length - 1;

  let prev: Path<T> = dest;
  for (let i = 0; i < lastInd; i++) {

    const subkey = parts[i];

    // no values assigned yet, so prev[subKey] can only be Path
    if (prev[subkey]) prev = prev[subkey] as Path<T>;
    else prev = prev[subkey] = NewPath<T>(subkey);

  }

  // assign value at final key.
  (prev as Path<T>)[parts[lastInd]] = value;

}