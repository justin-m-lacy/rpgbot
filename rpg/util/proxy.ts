
/**
 * Symbol to return Proxy wrapper from proxied object.
 */
const SymHandler = Symbol('ProxHandler');

/**
 * Get proxy handler for proxied object, or undefined
 * if none found.
 * @param obj 
 * @returns 
 */
export function proxyHandler<T>(obj: any) {

	return typeof obj === 'object' ? obj?.[SymHandler] as T | undefined : undefined;

}

/**
 * Converts wrapper object to a ProxyHandler for target.
 * Getters/setters on the returned proxy will check for
 * matching getter/setter in wrapper before fallback to target.
 * @param wrapper - object with properties that will be checked before target.
 * @param targ 
 * @returns 
 */
export const asProxy = <P extends object, T extends object>(wrapper: P, targ: T) => {

	/// Extend wrapper into a proxy handler.
	return new Proxy<T & P>(targ as any,
		Object.assign(wrapper, {
			/// Gets reference to proxy handler.
			[SymHandler]: wrapper
		}, ProxyHandler)
	);

}

/**
 * 'this' in the functions below is the (extended) ProxyHandler itself.
 */
const ProxyHandler: ProxyHandler<object> = {

	set(targ, p, val) {

		if (Reflect.has(this, p)) {
			return Reflect.set(this, p, val);
		}
		return Reflect.set(targ, p, val);

	},
	get(targ, p) {

		if (Reflect.has(this, p) && p !== 'get' && p !== 'set') {
			return Reflect.get(this, p);
		}
		return Reflect.get(targ, p);

	}

};