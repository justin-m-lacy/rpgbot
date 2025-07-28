import { ParseTarget, TargetFlags } from "rpg/combat/targets";

describe('TargetFlag tests', () => {

	it('should parse Target strings', () => {

		expect(ParseTarget('other')).toBe(TargetFlags.other);

		expect(ParseTarget('self,enemy')).toBe(TargetFlags.self | TargetFlags.enemy);

		expect(ParseTarget()).toBe(TargetFlags.enemies);

		expect(ParseTarget('allies,self,enemies')).toBe(TargetFlags.allies | TargetFlags.self | TargetFlags.enemies);


	});


});