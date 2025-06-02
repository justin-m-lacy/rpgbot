export type Auth = {

    /**
     * Discord application token.
     */
    token: string,

    /**
     * id of bot owner.
     */
    owner: string,
    /**
     * account ids with authority to control bot.
     */
    admins?: string[],
    dev?: {
        token: string
    }
}