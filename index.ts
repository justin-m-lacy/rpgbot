import { Client, GatewayIntentBits } from 'discord.js';

import { Auth } from '@/bot/auth';
import "dotenv/config";
import { initBaseCommands } from './src/base-commands';
import { DiscordBot } from './src/bot/discordbot';

// Ensure current working directory is directory of the base script.
process.chdir(__dirname);

// init bot
const client: Client = new Client({

	closeTimeout: 10000,
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildExpressions,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildPresences,
	],
	sweepers: {
		messages: {
			interval: 1000,
			lifetime: 600
		}
	}
});

client.on('error', err => {
	console.error('Connection error: ' + err.message);
});
client.on('shardError', error => {
	console.error('Websocket connection error:', error);
});

console.log('client created.');

const initBot = async () => {

	const auth = (await import('./auth.json', { assert: { type: 'json' } })).default as Auth;
	const config = await loadConfig();

	console.log(`base directory: ${__dirname}`);
	try {
		const bot = new DiscordBot(client, auth, config, __dirname);
		initBaseCommands(bot);

		//await InitGame(bot);

		tryLogin(auth);

		return bot;

	} catch (e) {
		console.error(e);
	}


}

initBot()!;

/**
 * Load config file.
 */
async function loadConfig() {

	try {

		const config = (await import('./config.json', { assert: { type: 'json' } })).default;

		if (process.env.NODE_ENV !== 'production' && config.dev) {
			Object.assign(config, config.dev);
		}
		return config;

	} catch (e) {
		return {};
	}

}


function tryLogin(auth: Auth) {

	console.log(`login with mode: ${process.env.NODE_ENV ?? 'dev'}`);
	client.login((process.env.NODE_ENV !== 'production' && auth.dev != null) ? auth.dev?.token ?? auth.token : auth.token);


}