import type { Actor } from "rpg/char/actor";
import type { Char } from "rpg/char/char";
import type { Effect } from "rpg/magic/effects";

export type History = {
    explore?: number,
    crafts?: number,
    given?: number,
    cook?: number,
    died?: number,
    eat?: number,
} & Record<string, number>;



export type CharEvents = {

    effectStart: (char: Actor, efx: Effect) => void;
    effectEnd: (char: Actor, efx: Effect) => void;
    died: (char: Char) => void;
    revived: (char: Char) => void;
    levelUp: (char: Char) => void;

}


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


const histories = {
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