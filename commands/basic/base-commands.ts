import { DiscordBot } from '../../src/bot/discordbot';

import { CommandData, NewCommand, NumOpt, StrOpt, type ChatAction, type Command } from '@/bot/command';
import { SendPrivate } from '@/utils/display';
import { PermissionFlagsBits } from 'discord.js';
import { parseRoll } from '../../rpg/values/dice';

export function GetCommands(): Command[] {

    return [
        CmdBackup, CmdShutdown, CmdLeaveGuild, CmdProxy, CmdRoll, CmdSay
    ]

}

/**
* Backup unsaved cache items.
*/
const CmdBackup = NewCommand({
    data: CommandData('backup', 'Force backup bot data')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    exec: async (m: ChatAction, bot: DiscordBot) => {

        if (await bot.backup(m.user)) {
            return SendPrivate(m, 'backup complete.');
        }
    }
})

/**
 * Shutdown the bot program. Owner only.
 */
const CmdShutdown = NewCommand({
    data: CommandData('shutdown', 'Shutdown bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    exec: async (m: ChatAction, bot: DiscordBot) => {
        await bot.shutdown(m.user);
    }
})

/**
 * Make Bot leave guild.
 * @async
 * @param m
 * @returns
 */
const CmdLeaveGuild = NewCommand({
    data: CommandData('botleave', 'Remove bot from guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    exec: async (m: ChatAction, bot: DiscordBot) => {

        if (m.guild && await bot.leaveGuild(m)) {
            SendPrivate(m, 'Left guild ' + m.guild.name);
        } else {
            SendPrivate(m, 'Leave guild failed');
        }

    }
})


/**
 * Proxy the current context to the user's DM.
 */
const CmdProxy = NewCommand({

    data: CommandData('proxy', 'Proxy this room to your private chat'),
    exec: async (m: ChatAction, bot: DiscordBot) => {

        if (await bot.makeProxy(m)) {
            return m.user.send('Proxy created.');
        } else {
            SendPrivate(m, 'Create proxy failed')
        }
    }
})

/**
 * Reset command's permissions to default.
 */
const CmdResetAccess = NewCommand({
    data: CommandData('cmdreset', 'Reset command permissions', [
        StrOpt('cmd', 'Command name', true)
    ]),
    exec: async (m: ChatAction, bot: DiscordBot) => {

        const cmd = m.options.getString('cmd', true);
        if (await bot.resetCommandAccess(m, cmd)) {
            return SendPrivate(m, 'Access reset.');
        } else {

        }

    }
})


const CmdHelp: Command = NewCommand({

    data: CommandData('help', 'Get command help',
        [
            StrOpt('cmd', 'Command name'),
            NumOpt('page', 'Help page number')

        ]
    ),
    exec: (msg: ChatAction, bot: DiscordBot) => {

        const cmd = msg.options.getString('cmd');
        const page = msg.options.getNumber('page') ?? undefined;

        const cmdPage = cmd ? Number.parseInt(cmd) : undefined;

        if (cmd) {

            return bot.printCommand(msg, cmd, page);

        } else {
            bot.printCommands(msg, cmdPage);
        }

    }
})

const CmdRoll = NewCommand({

    data: CommandData('roll', 'Simulate dice roll',
        [
            StrOpt('dice', 'Dice to roll ( xdy+z: ex. 1d6, 2d5, 4d3+4)', true),

        ]
    ),
    exec: async (m: ChatAction) => {

        try {

            const dice = m.options.getString('dice', true);
            const total = parseRoll(dice);
            return m.reply(m.user.displayName + ' rolled ' + total);

        } catch (err) {

            if (err instanceof RangeError) {
                return SendPrivate(m, "Number values are too large.");
            }
            return SendPrivate(m, 'Dice format must be: xdy+z');

        }


    }
})

const CmdSay = NewCommand({
    data: CommandData('say', 'Admin public message',
        [
            StrOpt('what', 'What bot will say', true),

        ]
    ).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    exec: (msg: ChatAction,) => {

        const what = msg.options.getString('what', true);
        return msg.reply(what);

    }
})