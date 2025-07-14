import { SendableChannels } from 'discord.js';


type Idable = { id: string };

const CreateStore = () => {

	const channels: WeakMap<Idable, SendableChannels> = new WeakMap();

	return {

		set(id: Idable, ch: SendableChannels) {
			channels.set(id, ch);
		},

		get(id?: Idable) {
			return id ? channels.get(id) : undefined;
		},

		clear(id: Idable) {
			channels.delete(id);
		},

	}

}


export const ChannelStore = CreateStore();