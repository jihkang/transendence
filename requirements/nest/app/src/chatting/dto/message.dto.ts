import {IsString, MaxLength} from 'class-validator';

export class MessageDto {
	@IsString()
	roomId: string;

	@IsString()
	@MaxLength(140)
	message: string;
}
