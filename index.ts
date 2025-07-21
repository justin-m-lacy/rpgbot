import { Client, GatewayIntentBits } from 'discord.js';

import { Auth } from '@/bot/auth';
import { IsCommand, IsCommandModule, type Command } from '@/bot/command';
import "dotenv/config";
import * as fs from 'fs';
import path from 'path';
import { InitGame } from 'rpg/init';
import { pathToFileURL } from 'url';
import { DiscordBot } from './src/discordbot';

// Ensure current working directory is directory of the base script.
process.chdir(import.meta.dirname);

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

	console.log(`base dir: ${import.meta.dirname}`);
	try {
		const bot = new DiscordBot(client, auth, config, import.meta.dirname);

		await InitGame();

		const cmds = await loadCommands();
		bot.addCommands(cmds)

		tryLogin(auth);

		return bot;

	} catch (e) {
		console.error(e);
	}


}

initBot()!;

async function loadCommands() {

	const ValidExtensions = ['', '.js', '.ts'];

	const commands: Command[] = [];

	// get all command files from the commands directory
	const commandsDir = path.resolve(import.meta.dirname, 'commands');

	const fileList = fs.readdirSync(commandsDir, { withFileTypes: true, recursive: true });

	for (const file of fileList) {

		if (!file.isFile()) continue;
		const ext = path.extname(file.name).toLowerCase();
		if (!ValidExtensions.includes(ext)) continue;

		const fileImport = (await import(
			pathToFileURL(
				path.resolve(file.parentPath, file.name)
			).href
		));

		if (IsCommandModule(fileImport)) {

			const newCommands = fileImport.GetCommands();
			if (Array.isArray(newCommands)) {
				commands.push(...newCommands);
			}

		} else if (IsCommand(fileImport.default)) {
			commands.push(fileImport.default);
		} else {
			console.log(`unknown file type: ${file.name}`);
		}

	}

	return commands;

}

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