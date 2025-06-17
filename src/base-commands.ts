import { GuildMember, Message, PermissionFlagsBits } from 'discord.js';
import { DiscordBot } from './bot/discordbot';

import { parseRoll } from '../rpg/values/dice';

let bot: DiscordBot;


export function initBaseCommands(b: DiscordBot) {

    const DefaultModule = 'default';

    bot = b;
    const cmds = b.dispatch;

    cmds.add('help', 'help <cmd>', cmdHelp, { maxArgs: 2, module: DefaultModule });
    cmds.add('roll', '!roll [n]d[s]', cmdRoll, { maxArgs: 1, module: DefaultModule });

    cmds.add('uname', "uname <nickname> - get user's username", cmdUName, { maxArgs: 1, module: DefaultModule });
    cmds.add('nick', "nick <displayName> - get user's nickname", cmdNick, { maxArgs: 1, module: DefaultModule });
    cmds.add('displayname', "displayname <user> - get user's display name.", cmdDisplayName, { maxArgs: 1, module: DefaultModule });

    cmds.add('say', '', cmdSay, { maxArgs: 1, module: DefaultModule, hidden: true, access: PermissionFlagsBits.Administrator });

}

/**
 * @async
 * @param msg
 * @param name
 * @returns
 */
const cmdUName = async (msg: Message<true>, name: string) => {

    const gMember = bot.userOrSendErr(msg.channel, name);
    if (!gMember || !(gMember instanceof GuildMember)) return;
    return msg.channel.send(name + ' user name: ' + gMember.user.username)

}

/**
 * @async
 * @param msg
 * @param name
 * @returns
 */
const cmdNick = async (msg: Message<true>, name: string) => {

    const gMember = bot.userOrSendErr(msg.channel, name);
    if (gMember && (gMember instanceof GuildMember)) {
        return msg.channel.send(name + ' nickname: ' + gMember.nickname);
    }

}

const cmdDisplayName = async (msg: Message<true>, name: string) => {

    const usr = bot.userOrSendErr(msg.channel, name);
    if (usr && (usr instanceof GuildMember)) {
        return msg.channel.send(name + ' display name: ' + usr.displayName);
    }

}
/**
 *
 * @param  msg
 * @param cmd command to get help for.
 */
const cmdHelp = (msg: Message<true>, cmd?: string, page?: string) => {

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
const cmdRoll = async (msg: Message<true>, dicestr: string) => {

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

const cmdSay = (msg: Message<true>, what: string) => {

    return msg.channel.send(`[ ${what} ]`);
}