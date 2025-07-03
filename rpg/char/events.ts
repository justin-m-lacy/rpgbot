import type { Char } from "rpg/char/char";

export type History = {
    explore?: number,
    crafts?: number,
    given?: number,
    cook?: number,
    died?: number,
    eat?: number,
} & Record<string, number>;


export const getHistory = (char: Char) => {

    let txt = '';
    const hist = char.history;
    for (let k in hist) {

        const info = histories[k as keyof typeof histories];
        if (!info) continue;

        txt += info.desc.replace('%n', hist[k].toString())

    }

    return txt;

}


export const histories = {
    brew: {
        desc: '%n potions brewed.\n'
    },
    cook: {
        desc: '%n things cooked.\n'
    },
    crafts: {
        desc: '%n items crafted.\n'
    },
    eat: {
        desc: '%n meals eaten.\n'
    },
    explore: {
        desc: '%n locations discovered.\n'
    },
    inscribe: {
        desc: '%n items inscribed.\n'
    },
    pk: {
        desc: '%n heroes killed.\n'
    },
    quaff: {
        desc: '%n potions quaffed.\n'
    },
    slay: {
        desc: '%n monsters slain.\n'
    },
    stolen: {
        desc: '%n items stolen.\n'
    },

}