import { PermissionFlagsBits } from 'discord.js';
import { DiscordBot } from './bot/discordbot';

import type { ChatAction } from '@/bot/command';
import { parseRoll } from '../rpg/values/dice';

let bot: DiscordBot;


export function initBaseCommands(b: DiscordBot) {

    const DefaultModule = 'default';

    bot = b;
    const cmds = b.dispatch;

    // cmds.add('help', 'help <cmd>', cmdHelp, { maxArgs: 2, module: DefaultModule });
    cmds.add('roll', '!roll [n]d[s]', cmdRoll, { maxArgs: 1, module: DefaultModule });

    cmds.add('say', '', cmdSay, { maxArgs: 1, module: DefaultModule, hidden: true, access: PermissionFlagsBits.Administrator });

}

/**
 *
 * @param  msg
 * @param cmd command to get help for.
 */
const cmdHelp = (msg: ChatAction, cmd?: string, page?: string) => {

    if (!msg.channel?.isSendable()) return;

    const cmdPage = cmd ? Number.parseInt(cmd) : undefined;

    if (cmd && Number.isNaN(cmdPage)) {

        const usePage = page ? Number.parseInt(page) : 0;
        return bot.printCommand(msg.channel, cmd, usePage);

    } else {
        bot.printCommands(msg.channel, cmdPage);
    }

}

/**
 * @async
 * @param msg
 * @param dicestr - roll formatted string.
 * @returns
 */
const cmdRoll = async (msg: ChatAction, dicestr: string) => {

    if (!msg.channel?.isSendable()) return;

    try {

        const sender = bot.getSender(msg);
        const total = parseRoll(dicestr);
        return msg.channel.send(bot.displayName(sender) + ' rolled ' + total);

    } catch (err) {

        if (err instanceof RangeError) {
            return msg.channel.send("Don't be a dick.");
        }
        return msg.channel.send('Dice format must be: xdy+z');

    }


}

const cmdSay = (msg: ChatAction, what: string) => {

    if (msg.channel?.isSendable()) {
        return msg.channel.send(`[ ${what} ]`);
    }
}