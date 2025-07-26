
export const getEvil = (evil: number) => {

	if (evil >= 25) {

		if (evil > 1500) return 'diabolical';
		if (evil > 750) return 'malevolent';
		if (evil > 300) return 'evil';
		if (evil > 100) return 'wicked';
		return 'mean';

	} else if (evil <= -25) {

		if (evil < -1500) return 'righteous';
		if (evil < -750) return 'virtuous';
		if (evil < -300) return 'good';
		if (evil < -100) return 'nice';

		return 'polite';

	} else return 'neutral';

	//if ( evil < -30 ) return 'diabolical'
	//['mean','wicked', 'evil', 'diabolical'],
	//['nice', 'good', '', 'righteous'];

};