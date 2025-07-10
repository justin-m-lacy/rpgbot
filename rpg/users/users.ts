export type UserData = {

	// user id.
	id: string;

	// chars on server.
	chars: Record<string, { id: string, level: number }>;

	// name of last loaded char.
	curChar: string | null;

}

export const NewUserData = (userId: string): UserData => {

	return {
		id: userId,
		chars: {},
		curChar: null
	};

}

/**
 * Get total levels of all a user's chars.
 * @param data 
 */
export const GetUserLevels = (data: UserData) => {

	let lvl: number = 0;
	for (const k in data.chars) {
		lvl += data.chars[k].level;
	}

	return lvl;

}