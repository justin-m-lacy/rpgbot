import { HasCommands } from '@/bot/command';
import { REST, Routes, type RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import * as fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { appId, token } from '../auth.json';

const ValidExtensions = ['', '.js', '.ts'];

(async function () {

	const cmds = await findCommands();
	await sendCommands(cmds);

})();

async function findCommands() {

	const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

	// get all command files from the commands directory
	const commandsDir = path.join(__dirname, 'commands');
	const fileList = fs.readdirSync(commandsDir, { withFileTypes: true });

	for (const file of fileList) {

		if (!file.isFile()) continue;
		const ext = path.extname(file.name).toLowerCase();
		if (!ValidExtensions.includes(ext)) continue;

		const fileImport = await import(
			pathToFileURL(
				path.resolve(file.parentPath, file.name)
			).href
		);

		if (HasCommands(fileImport)) {

			const newCommands = fileImport.GetCommands().map(cmd => cmd.data.toJSON());
			commands.push(...newCommands);

		}

	}

	return commands;

}

async function sendCommands(commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]) {
	// Construct and prepare an instance of the REST module
	const rest = new REST().setToken(token);


	try {
		console.log(`Begin refresh ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands with the current set
		const data: any = await rest.put(
			Routes.applicationCommands(appId),
			{ body: commands },
		);

		console.log(`Successfully updated ${data.length} application (/) commands.`);

	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}


}