import type { ChatCommand } from '@/bot/cmd-wrapper';
import { EmbedBuilder, Message, MessageFlags } from 'discord.js';


export const getEmbedUrl = (m: Message) => {

    const url = m.embeds.find(e => e.image?.url != null);
    if (url != null) {
        return url.image?.url;
    } else {

        const attach = m.attachments.find(

            a => a.url != null || a.proxyURL != null

        );
        if (attach) {
            return attach.url ?? attach.proxyURL;
        }

    }
}

export const makeImageEmbed = (imageUrl: string) => {
    return new EmbedBuilder({ image: { url: imageUrl, proxy_url: imageUrl } });
}

export const ReplyEmbed = (m: ChatCommand, embedUrl: string, text?: string | null,) => {
    return m.reply(
        {

            content: (text && text.length > 0) ? text : ' ',
            embeds: [
                makeImageEmbed(embedUrl)
            ],
            flags: MessageFlags.Ephemeral
        }
    );
}

export const sendEmbedUrl = (m: Message<true>, embedUrl: string, text?: string | null,) => {

    return m.channel.send({
        content: (text && text.length > 0) ? text : ' ', embeds: [
            makeImageEmbed(embedUrl)
        ]
    });

}

