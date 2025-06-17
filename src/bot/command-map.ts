import type { CommandFunc } from "@/bot/command";



export const CommandMap = () => {

	const commands = new Map<string, CommandFunc>;


	return {
		get(k: string) { return commands.get(k) },
		set(k: string, f: CommandFunc) { commands.set(k, f) }
	}


}