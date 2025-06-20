import { DiscordBot } from '../../src/bot/discordbot';

import { CommandData, NumOpt, StrOpt, type ChatAction, type Command } from '@/bot/command';
import { MessageFlags, PermissionFlagsBits } from 'discord.js';
import { parseRoll } from '../../rpg/values/dice';

export function GetCommands(): Command[] {

    return [
        CmdBackup, CmdShutdown, CmdLeaveGuild, CmdProxy, CmdRoll, CmdSay
    ]

}

/**
* Backup unsaved cache items.
*/
const CmdBackup = {
    data: CommandData('backup', 'Force backup bot data')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    exec: async (m: ChatAction, bot: DiscordBot) => {

        if (await bot.backup(m.user)) {
            return m.reply({
                content: 'backup complete.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}

/**
 * Shutdown the bot program. Owner only.
 */
const CmdShutdown = {
    data: CommandData('shutdown', 'Shutdown bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    exec: async (m: ChatAction, bot: DiscordBot) => {
        await bot.shutdown(m.user);
    }
}

/**
 * Make Bot leave guild.
 * @async
 * @param m
 * @returns
 */
const CmdLeaveGuild = {
    data: CommandData('botleave', 'Remove bot from guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    exec: async (m: ChatAction, bot: DiscordBot) => {

        if (m.guild && await bot.leaveGuild(m)) {
            m.reply({
                content: 'Left guild ' + m.guild.name,
                flags: MessageFlags.Ephemeral
            });
        } else {
            m.reply({
                content: 'Leave guild failed',
                flags: MessageFlags.Ephemeral
            });
        }

    }
}


/**
 * Proxy the current context to the user's DM.
 */
const CmdProxy = {

    data: CommandData('proxy', 'Proxy this room to your private chat'),
    exec: async (m: ChatAction, bot: DiscordBot) => {

        if (await bot.makeProxy(m)) {
            return m.user.send('Proxy created.');
        } else {
            m.reply({
                content: 'Create proxy failed',
                flags: MessageFlags.Ephemeral
            })
        }
    }
}

/**
 * Reset command's permissions to default.
 */
const CmdResetAccess = {
    data: CommandData('cmdreset', 'Reset command permissions', [
        StrOpt('cmd', 'Command name', true)
    ]),
    exec: async (it: ChatAction, bot: DiscordBot) => {

        const cmd = it.options.getString('cmd', true);
        if (await bot.resetCommandAccess(it, cmd)) {
            return it.reply({
                content: 'Access reset.',
                flags: MessageFlags.Ephemeral
            });
        } else {

        }

    }
}


const CmdHelp: Command = {

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
}

const CmdRoll = {

    data: CommandData('roll', 'Simulate dice roll',
        [
            StrOpt('dice', 'Dice to roll ( xdy+z: ex. 1d6, 2d5, 4d3+4)', true),

        ]
    ),
    exec: async (msg: ChatAction) => {

        try {

            const dice = msg.options.getString('dice', true);
            const total = parseRoll(dice);
            return msg.reply(msg.user.displayName + ' rolled ' + total);

        } catch (err) {

            if (err instanceof RangeError) {
                return msg.reply({
                    content: "Number values are too large.", flags: MessageFlags.Ephemeral
                });
            }
            return msg.reply({
                content: 'Dice format must be: xdy+z',
                flags: MessageFlags.Ephemeral
            });

        }


    }
}

const CmdSay = {
    data: CommandData('say', 'Admin public message',
        [
            StrOpt('what', 'What bot will say', true),

        ]
    ).setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    exec: (msg: ChatAction,) => {

        const what = msg.options.getString('what', true);
        return msg.reply(what);

    }
}