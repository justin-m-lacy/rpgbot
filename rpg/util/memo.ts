export const MemoOf = <T extends object>(proto: T, memo?: T) => {

	if (memo) {

		if (!Object.hasOwn(memo, 'proto')) {
			Object.defineProperty(memo, 'proto', {
				value: proto
			});
		}

	}

	return new Proxy<T>(memo ?? { proto } as T, ProtoProxy);


}


const ProtoProxy: ProxyHandler<object> = {

	set(targ, p, val) {
		return Reflect.set(targ, p, val);
	},
	get(targ, p) {

		if (Reflect.has(targ, p)) return Reflect.get(targ, p);
		return Reflect.get(Reflect.get(targ, 'proto'), p);
	}

}

/*
would require a new proxy handler for every proto, along with the proxy
export const protoProxy = <T extends object>(proto: T) => {

	return {

		proto,
		set(targ, p, val) {
			return Reflect.set(targ, p, val);
		},
		get(targ, p, rec) {

			if (Reflect.has(targ, p)) return Reflect.get(targ, p);
			return Reflect.get(rec.proxy, p);
		}

	} as ProxyHandler<T>;

}*/
