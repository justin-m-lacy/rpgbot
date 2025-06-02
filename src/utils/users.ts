import { Message } from 'discord.js';

export const getSenderName = (m: Message) => {

    if (m.member) {
        return m.member.displayName ?? m.member.nickname ?? m.member.user.username;
    } else {
        return m.author.username;
    }

}