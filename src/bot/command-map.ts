import type { Command } from "@/bot/command";



export const CommandMap = () => {

	const commands = new Map<string, Command<any>>();


	return {
		entries() { return commands.entries() },
		values() { return commands.values() },
		get(k: string) { return commands.get(k) },
		set(k: string, cmd: Command) {
			commands.set(k, cmd);
			if (cmd.alias) commands.set(cmd.alias, cmd);
		}
	}


}