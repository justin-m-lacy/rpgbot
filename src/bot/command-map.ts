import type { CommandData } from "@/bot/command";



export const CommandMap = () => {

	const commands = new Map<string, CommandData<any>>();


	return {
		entries() { return commands.entries() },
		values() { return commands.values() },
		get(k: string) { return commands.get(k) },
		set(k: string, cmd: CommandData) { commands.set(k, cmd) }
	}


}