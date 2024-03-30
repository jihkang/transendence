import {IsAlphanumeric, IsBoolean, Length} from 'class-validator';

export class AuthUpdateDto {
	@IsAlphanumeric()
	@Length(4, 20)
	name: string;
}
