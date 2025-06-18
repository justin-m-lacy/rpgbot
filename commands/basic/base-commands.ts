import { DiscordBot } from '../../src/bot/discordbot';

import { NewCommand, NumOpt, StrOpt, type ChatAction, type CommandData } from '@/bot/command';
import { parseRoll } from '../../rpg/values/dice';

export function GetCommands(b: DiscordBot) {

    return [
        CmdRoll, CmdSay
    ]

}

const CmdHelp: CommandData = {

    data: NewCommand('help', 'Get command help',
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

    data: NewCommand('roll', 'Simulate dice roll',
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
                return msg.reply("Number values are too large.");
            }
            return msg.reply('Dice format must be: xdy+z');

        }


    }
}

const CmdSay = {
    data: NewCommand('say', 'Admin public message',
        [
            StrOpt('what', 'What bot will say', true),

        ]
    ),
    exec: (msg: ChatAction,) => {

        const what = msg.options.getString('what', true);
        return msg.reply(`[ ${what} ]`);

    }
}