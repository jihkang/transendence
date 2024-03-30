import {IsAlphanumeric, Length} from 'class-validator';

export class UserUpdateDto {
	@IsAlphanumeric()
	@Length(4, 20)
	name: string;
}
