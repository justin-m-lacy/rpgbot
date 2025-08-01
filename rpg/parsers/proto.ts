import { ParseResult } from 'rpg/effects/results';
import { RawItemData } from 'rpg/items/types';
import { Uppercase } from 'rpg/util/string';

export const InitProto = (it: RawItemData & any) => {

	if (!it.id) it.id = it.name!.toLowerCase();
	else if (!it.name) it.name = Uppercase(it.id!);

	if (it.ondrop) {
		it.ondrop = ParseResult(it.ondrop);
	}

	return it;

}