import {IsNumberString, Length} from 'class-validator';

export class CheckCodeDto {
	@IsNumberString()
	// @Length(6, 6)
	code: string;
}
